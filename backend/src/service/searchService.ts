import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_ENGINE_ID;
const CX = process.env.GOOGLE_ENGINE_ID

export async function googleSearch(query: string, num: number = 3) {
  const url = "https://www.googleapis.com/customsearch/v1";
  console.log("search", query[0])
  try {
    const response = await axios.get(url, {
      params: {
        key: GOOGLE_API_KEY,
        cx: CX,
        q: query,
        num,
      },
    });

    const data = response.data as { items?: any[] };
    return data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    })) || [];
  } catch (error) {
    console.error("Google Search API error:", error);
    return [];
  }
}