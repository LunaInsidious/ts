import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { logger } from "../util/logger";

const main = async () => {
    const client = new S3Client({
        endpoint: "http://localhost:9000",
        forcePathStyle: true,
        credentials: {
            accessKeyId: "CB624u2csl9BnYpbagZZ",
            secretAccessKey: "KU6Sp9MjZhZcCsGN3pr4mubYVdWwwzaMOWLMwHwB"
        }
    });

    const command = new GetObjectCommand({
        Bucket: "sobo-master",
        Key: "masterGeojson/AreaMunicipalityWithPref.geo.json",
    });

    try {
        const response = await client.send(command);
        logger.info({ body: response.Body }, `Load master file.`);
        const jsonText = await response.Body?.transformToString("utf8");
        if (jsonText == null) {
            logger.error(`Failed to load yaml file.`);
            return undefined;
        }
        const master = JSON.parse(jsonText);
        return master;
    } catch (error) {
        logger.error(error, `Failed to load master file.`);
        return undefined;
    }
}

main()
