import { Dictionary } from "./dictionary.model";
export interface Repository extends Dictionary<any>
{
  dateTime: Date;
}
