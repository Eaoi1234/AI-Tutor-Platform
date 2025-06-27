import { error } from "console";
import { googleSearch } from "../service/searchService";

export const searchController = async (req: any, res: any) => {
  let keyword = req.body.keyword;
  keyword = String(keyword)
  console.log(typeof(keyword), keyword)


  if (!keyword) {
    return res.status(400).json({
      error: "no text lol",
    });
  }

  try {
    const sites = await googleSearch(keyword);
    console.log(sites);
    return res.status(200).json({
      message: sites,
    });
  } catch (error) {
    return res.status(500).json({
        message:"internal server error"
    })
  }
  return res.status(200).json({
    message:"idk man"
  })
};
