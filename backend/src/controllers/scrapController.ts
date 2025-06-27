import { Request, Response } from "express"
import { autoScrape } from "../service/scrapers/autoScraper"

export const scrapController = async (req: Request, res: Response)=>{
    const url = (req.body.url)

    if(!url){
        return res.status(400).json({
            error:"no url or incorrect url"
        })
    }
    try {
            const data = await autoScrape(url)
            return res.status(200).json(
                {
                    message:data
                }
            )
        } catch (error) {
            return res.status(500).json({
                error:"internal server error"
            })
        }
    return res.status(200).json({
        message:"idk man u gon noin"
    })
}