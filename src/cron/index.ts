import { isValidCron } from "cron-validator";
import { logger } from "../util/logger";

try {
    isValidCron('0/100 1-3,5,*/100,* 00 * * */100');
    logger.info('Cron is valaid');
} catch (error) {
    console.log("error", error)
}
