export function createTimer(label = 'Task') {
  const start = performance.now();
  console.log(`[⏱️ Timer] Started: ${label}...`);

  return {
    end: () => {
      const end = performance.now();
      const timeMs = end - start;
      const timeSec = (timeMs / 1000).toFixed(2);
      
      console.log(`[⏱️ Timer] Completed: ${label}. Time elapsed: ${timeSec} seconds (${timeMs.toFixed(0)}ms).`);
      
      return timeMs;
    }
  };
}
