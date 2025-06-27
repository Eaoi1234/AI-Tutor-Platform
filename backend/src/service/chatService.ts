import { searchWithGoogleProgrammableSearch, SearchResultItem } from "./googleService"; // ✅ Correct import

/**
 * Processes incoming data, performs searches using Google Programmable Search,
 * and structures the results.
 *
 * @param contents Array of objects with phase and description (description will be used as search queries).
 * @param roadmap Roadmap data (may not be directly used in search but kept in structure).
 * @param googleSearchAPIKey Google API Key for search.
 * @param googleSearchEngineID Google Custom Search Engine ID for search.
 * @returns A Promise that resolves to an Array of structured data with search results.
 */

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function processRoadmapWithSearch( // Renamed from chatWithGemini
  contents: {
    phase: number;
    description: string;
  }[],
  roadmap: string,
): Promise<{
  phase: number;
  title: string;
  docs: {
    chap: string;
    content: string;
    link?: string[];
    allSearchResults?: SearchResultItem[];
  }[];
}[]> {
  console.log("[ProcessRoadmap] Starting roadmap processing with Programmable Search...");
  console.log("[ProcessRoadmap] Contents received:", contents);
  console.log("[ProcessRoadmap] Roadmap received:", roadmap);

  const processedPhases: {
    phase: number;
    title: string;
    docs: {
      chap: string;
      content: string;
      link?: string[];
      allSearchResults?: SearchResultItem[];
    }[];
  }[] = [];

  for (const content of contents) {
    const chaps = content.description.split(":::"); // Split description into sub-queries
    const phase = content.phase;
    const phaseTitle = chaps[0].trim();
    const docs: {
      chap: string;
      content: string;
      link?: string[];
      allSearchResults?: SearchResultItem[];
    }[] = []

    console.log(`\n--- [ProcessRoadmap] Processing Phase ${phase} ---`);
    console.log("[ProcessRoadmap] Sub-topics (chaps):", chaps);

    for (const chap of chaps) {
      const trimmedChap = chap.trim();
      if (!trimmedChap) { // Skip if search query is empty
        continue;
      }

      console.log(`  [ProcessRoadmap] Searching for: "${trimmedChap}"`);

      // *** Call searchWithGoogleProgrammableSearch here ***
      const searchResults: SearchResultItem[] | null = await searchWithGoogleProgrammableSearch(
        trimmedChap,
      );

      let searchContent = "No relevant search results found."; // Default content if no results
      let topThreeLinks: string[] = [];
      let allResultsForChap: SearchResultItem[] = [];

      if (searchResults && searchResults.length > 0) {
        // Select the information from search results you want to use
        // Example: Combine snippet of the first 3 results and store the first link
        searchContent = searchResults.slice(0, 3).map(item => `${item.title}: ${item.snippet}`).join('\n\n');
        topThreeLinks = searchResults.slice(0, 3).map(item => item.link || '').filter(link => link !== ''); 

        console.log(`  [ProcessRoadmap] Found ${searchResults.length} search results for "${trimmedChap}".`);
      } else {
        console.log(`  [ProcessRoadmap] No search results for "${trimmedChap}".`);
      }

      docs.push({
        chap: trimmedChap,
        content: searchContent,
        link: topThreeLinks, 
        allSearchResults: allResultsForChap, 
      });
      await delay(500)
      
    }

    processedPhases.push({
      phase: phase,
      title: phaseTitle,
      docs: docs,
    });
    console.log(processedPhases[0].docs)
  }

  console.log("\n--- [ProcessRoadmap] Processing Complete ---");
  // console.log("[ProcessRoadmap] Generated Content Structure:", JSON.stringify(processedPhases, null, 2)); // ✅ Remove this console.log if you only want to return

  return processedPhases;
}
