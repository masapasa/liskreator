import { CreateNFTBodyParams, UnderdogAPI } from "../../utils/underdog";
import Arweave from "arweave";

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
    try {
        const underdog = new UnderdogAPI(config.underdogApiKey);

        const createNFTBodyParams: CreateNFTBodyParams = (await readBody(event)) as CreateNFTBodyParams;

        // const arweave = Arweave.init({
        //     host: "arweave.net",
        //     port: 443,
        //     protocol: "https",
        //     timeout: 20000,
        //     logging: false,
        // })

        // const transaction = await arweave.createTransaction({
        //     data: Buffer.from(
        //         createNFTBodyParams.image.split(",")[1],
        //         "base64"
        //     ),
        // });

        // transaction.addTag("Content-Type", "image/png");

        // const wallet = JSON.parse(config.arWallet)

        // await arweave.transactions.sign(transaction, wallet);

        // const response = await arweave.transactions.post(transaction);

        // const id = transaction.id;
        // const imageUrl = id ? `https://arweave.net/${id}` : undefined;

        // if (!imageUrl) {
        //     return {
        //         statusCode: 500,
        //         message: "Image upload failed",
        //     };
        // }


        const db = new JsonDB("/Users/aswin/Documents/underdog-memeletter/db.json");
        const subscribers: string[] = db.readOne("subscribers");

        await underdog.nftsBatch(subscribers,createNFTBodyParams)

        return {
            statusCode: 200,
        };
    } catch (error) {
        return {
            statusCode: 500,
            message: `${error}`,
        };
    }
});
