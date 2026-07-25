let pyodide: any = null;

async function initPyodide() {
    if (pyodide) return pyodide;
    // @ts-ignore
    const pyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.mjs");
    pyodide = await pyodideModule.loadPyodide();
    await pyodide.loadPackage(['Pillow']);
    return pyodide;
}

self.onmessage = async (event) => {
    try {
        const { id, images, intensity, scanStyle } = event.data;
        
        const py = await initPyodide();
        
        // Expose variables to python
        py.globals.set('js_images', images);
        py.globals.set('js_intensity', intensity || 1); // 1 to 5
        py.globals.set('js_scan_style', scanStyle || 'bw');

        const pythonCode = `
import io
import base64
import random
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

images = list(js_images)
processed_images = []

for i, img_data in enumerate(images):
    if img_data.startswith("data:image"):
        img_data = img_data.split(",")[1]
    img_bytes = base64.b64decode(img_data)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    
    style = str(js_scan_style)
    intensity = float(js_intensity)
    
    # 1. Base color conversion
    if style == 'bw':
        img = img.convert("L").convert("RGB")
    elif style == 'grainy':
        img = img.convert("L").convert("RGB")
    elif style == 'vintage':
        # Sepia/Vintage base: keep color but reduce it, and add yellow tint later
        color = ImageEnhance.Color(img)
        img = color.enhance(0.4)
    elif style == 'color':
        # Keep original color
        pass
        
    # 2. Optical Blur
    img = img.filter(ImageFilter.GaussianBlur(radius=intensity * 0.3))
    
    # 3. Contrast & Sharpness
    if style == 'bw' or style == 'grainy':
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.5 + intensity)
        sharp = ImageEnhance.Sharpness(img)
        img = sharp.enhance(1.5 + (intensity * 0.5))
    else:
        # Less aggressive contrast for color and vintage
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.0 + (intensity * 0.4))
        
    # 4. Color tinting / Grain
    if style == 'vintage':
        # Blend with a yellowish color
        yellow_layer = Image.new("RGB", img.size, (255, 245, 210))
        img = Image.blend(img, yellow_layer, 0.3 + (intensity * 0.05))
        # Reduce brightness slightly to look old
        bright = ImageEnhance.Brightness(img)
        img = bright.enhance(0.9)
    elif style == 'grainy':
        # Simulate grain by heavily over-sharpening blurred noise
        # This is a hacky way to add noise in PIL without numpy
        noise_img = img.filter(ImageFilter.BoxBlur(1))
        sharp = ImageEnhance.Sharpness(noise_img)
        noise_img = sharp.enhance(10.0 + (intensity * 2))
        img = Image.blend(img, noise_img, 0.5)
        bright = ImageEnhance.Brightness(img)
        img = bright.enhance(1.1)
    elif style == 'bw':
        bright = ImageEnhance.Brightness(img)
        img = bright.enhance(1.05)
    elif style == 'color':
        # Just wash out slightly
        bright = ImageEnhance.Brightness(img)
        img = bright.enhance(1.0 + (intensity * 0.05))
    
    # 5. Skew
    angle = random.uniform(-0.4 * intensity, 0.4 * intensity)
    img = img.rotate(angle, resample=Image.Resampling.BICUBIC, fillcolor=(255,255,255))
    
    processed_images.append(img)


# Save to PDF
out_pdf = io.BytesIO()
if len(processed_images) > 0:
    processed_images[0].save(
        out_pdf, 
        format="PDF", 
        save_all=True, 
        append_images=processed_images[1:],
        resolution=150.0
    )

pdf_bytes = out_pdf.getvalue()
pdf_bytes
        `;

        const resultBytes = await py.runPythonAsync(pythonCode);
        const resultUint8 = new Uint8Array(resultBytes);
        
        self.postMessage({ id, success: true, pdfData: resultUint8 });
        
    } catch (error) {
        self.postMessage({ id: event.data.id, success: false, error: (error as Error).message });
    }
};
