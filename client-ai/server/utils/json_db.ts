import fs from "fs";

interface JsonDBSchema {
  [key: string]: any;
}

export class JsonDB {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public read(): JsonDBSchema {
    const fileContent = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(fileContent);
  }

  public readOne(key: string): any {
    const data = this.read();
    return data[key];
  }

  write(data: JsonDBSchema): void {
    const fileContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(this.filePath, fileContent);
  }

  public create(key: string, value: any): void {
    const data = this.read();
    data[key] = value;
    this.write(data);
  }

  public update(key: string, value: any): void {
    const data = this.read();
    if (data.hasOwnProperty(key)) {
      data[key] = value;
      this.write(data);
    } else {
      throw new Error(`Key ${key} does not exist`);
    }
  }

  public delete(key: string): void {
    const data = this.read();
    if (data.hasOwnProperty(key)) {
      delete data[key];
      this.write(data);
    } else {
      throw new Error(`Key ${key} does not exist`);
    }
  }
}
