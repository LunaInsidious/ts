import { isValidCron } from "cron-validator";

try {
  isValidCron("0/100 1-3,5,*/100,* 00 * * */100");
  console.log("Cron is valaid");
} catch (error) {
  console.log("error", error);
}
