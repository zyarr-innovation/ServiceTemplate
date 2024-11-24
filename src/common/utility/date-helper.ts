import moment from "moment";

export function formatUTCTime(format: string): string {
  return moment.utc(new Date()).format(format).toString();
}

export function formatDate(date: any) {
  let inDate = new Date(date);

  let month = "" + (inDate.getMonth() + 1);
  let day = "" + inDate.getDate();
  let year = "" + inDate.getFullYear();

  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join("-");
}
