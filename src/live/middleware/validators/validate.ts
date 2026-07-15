import { z } from "zod";

/**
 * Validates some raw data
 * @param schema The schema against which to validate
 * @param data The data to validate
 * @returns The validated data, else null
 */
export function validate<T>(schema: z.ZodType, data: any): T | null {
    const result = schema.safeParse(data);
    if (result.success) {
        return result.data as T;
    }
    else {
        return null;
    }
}
