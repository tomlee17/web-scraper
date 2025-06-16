import fs from 'node:fs/promises';

export const exportToJson =  async(data: unknown, filePath: string) => {
    const json_string = JSON.stringify(data, null, 4);
    await fs.writeFile(filePath, json_string);
}

export const TIMEOUT_10 = 10000;
export const TIMEOUT_20 = 20000;
export const TIME = {
    OUT_10: { timeout: TIMEOUT_10 },
    OUT_20: { timeout: TIMEOUT_20 },
}