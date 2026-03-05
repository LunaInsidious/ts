// defaultで設定されていないフィールドが入るのか確認
import { z } from "zod";

const schema = z.object({
    name: z.string().default("John Doe"),
    age: z.number(),
});

const data = {
    age: 30,
};

const result = schema.parse(data);
console.log(result); // { name: 'John Doe', age: 30 }

try {
    const data2 = {
        name: "Alice",
    };

    schema.parse(data2);
} catch (e) {
    console.error(e);
}
