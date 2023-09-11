import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface CreateNFTResponse {
  transactionId: string;
  nftId: number;
  projectId?: number;
  transferable: boolean;
  compressed: boolean;
  mintAddress: string;
}

export interface CreateNFTBodyParams {
  name: string;
  image: string;
  symbol?: string;
  description?: string;
  receiverAddress?: string;
  upsert?: boolean;
}

export enum NFTType {
  transferable = "t",
  nonTransferable = "n",
  compressed = "c",
}

export class UnderdogAPI {
  private api: AxiosInstance;

  constructor(apiKey: string) {
    this.api = axios.create({
      baseURL: "https://dev.underdogprotocol.com",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  private async makePostRequest<TRes, TBody>(
    url: string,
    body: TBody
  ): Promise<TRes> {
    try {
      const response: AxiosResponse<TRes> = await this.api.post(url, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.log("error" , error);
      throw new Error(`API request failed: ${error}`);
    }
  }

  async createNFT(
    projectId: number,
    type: NFTType,
    nftData: CreateNFTBodyParams
  ) {
    const url = `v2/projects/${type}/${projectId}/nfts`;

    return this.makePostRequest<CreateNFTResponse, CreateNFTBodyParams>(
      url,
      nftData
    );
  }

  async nftsBatch(recipients: string[], nft: CreateNFTBodyParams) {
    const url = `v2/projects/t/1/nfts/batch`;

    return this.makePostRequest<{}, CreateNFTBodyParams[]>(
      url,
      recipients.map((recipient) => {
        return {
          ...nft,
          receiverAddress: recipient,
          upsert: true,
        };
      })
    );
  }
}
