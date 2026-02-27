/**
 * Compresses parsed LinkedIn data to prevent token overflow (429 errors).
 * Extracts only the Top 5 entries for demographics and top posts.
 */
export const compressLinkedInData = (parsedData: Record<string, any[]>) => {
  const compressed: Record<string, any> = {
    topPosts: [],
    demographics: [],
    engagement: []
  };

  try {
    const sheetNames = Object.keys(parsedData);

    // 1. Extract Top Posts (Fuzzy match sheet name)
    const postsSheet = sheetNames.find(k => k.toLowerCase().includes('post') || k.toLowerCase().includes('content'));
    if (postsSheet && parsedData[postsSheet]) {
      // Sort by Impressions/Views if available, otherwise take first 5
      const posts = parsedData[postsSheet];
      compressed.topPosts = posts.slice(0, 5).map(post => {
        // Keep only essential keys
        const cleanPost: any = {};
        Object.keys(post).forEach(key => {
          const k = key.toLowerCase();
          if (k.includes('link') || k.includes('content') || k.includes('impression') || k.includes('view') || k.includes('reaction') || k.includes('comment')) {
            cleanPost[key] = post[key];
          }
        });
        return cleanPost;
      });
    }

    // 2. Extract Demographics
    const demoSheet = sheetNames.find(k => k.toLowerCase().includes('demographic'));
    if (demoSheet && parsedData[demoSheet]) {
      // Take top 15 rows overall (usually covers top 5 of Job Titles, Industries, etc.)
      compressed.demographics = parsedData[demoSheet].slice(0, 15);
    }

    // 3. Extract Engagement Summary
    const engSheet = sheetNames.find(k => k.toLowerCase().includes('engagement') || k.toLowerCase().includes('follower'));
    if (engSheet && parsedData[engSheet]) {
      // Take last 5 rows (most recent)
      const engData = parsedData[engSheet];
      compressed.engagement = engData.slice(-5);
    }

    // If it was a CSV with no sheets, just take top 20 rows
    if (parsedData['CSVData']) {
      compressed.generalData = parsedData['CSVData'].slice(0, 20);
    }

    return compressed;
  } catch (error) {
    console.error("Compression error", error);
    // Fallback: return a heavily truncated version of the raw data
    return { fallbackData: JSON.stringify(parsedData).substring(0, 2000) };
  }
};
