import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const voicesSearchParams = {
  query: parseAsString.withDefault(""),
  category: parseAsString.withDefault(""),
  language: parseAsString.withDefault(""),
};

export const voicesSearchParamsCache =
  createSearchParamsCache(voicesSearchParams);
