import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const main = async () => {
  const client = new S3Client({
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
      accessKeyId: "",
      secretAccessKey: "",
    },
  });

  const command = new GetObjectCommand({
    Bucket: "test",
    Key: "test.json",
  });

  try {
    const response = await client.send(command);
    console.log({ body: response.Body }, `Load master file.`);
    const jsonText = await response.Body?.transformToString("utf8");
    if (jsonText == null) {
      console.error(`Failed to load yaml file.`);
      return undefined;
    }
    const master = JSON.parse(jsonText);
    return master;
  } catch (error) {
    console.error(error, `Failed to load master file.`);
    return undefined;
  }
};

main();
