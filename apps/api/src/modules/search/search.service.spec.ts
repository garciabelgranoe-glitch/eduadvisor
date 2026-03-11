import { BadRequestException } from "@nestjs/common";
import { CacheService } from "../../common/cache/cache.service";
import { SchoolsService } from "../schools/schools.service";
import { SearchIndexService } from "./search-index.service";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  const query = { q: "colegio", country: "AR", limit: 12 };

  const schoolsServiceMock = {
    searchSchools: jest.fn()
  } as unknown as SchoolsService;

  const searchIndexServiceMock = {
    search: jest.fn(),
    reindexSchools: jest.fn(),
    getHealth: jest.fn()
  } as unknown as SearchIndexService;

  const cacheMock = {
    getOrSetJson: jest.fn(async (_namespace: string, _payload: unknown, _ttl: number, factory: () => Promise<unknown>) =>
      factory()
    ),
    invalidateMany: jest.fn()
  } as unknown as CacheService;

  let service: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SearchService(schoolsServiceMock, searchIndexServiceMock, cacheMock);
  });

  it("returns meilisearch results when index is available", async () => {
    (searchIndexServiceMock.search as jest.Mock).mockResolvedValue({
      items: [{ id: "1", name: "Colegio Test" }],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1, hasNextPage: false }
    });

    const result = await service.search(query);

    expect(result).toMatchObject({
      engine: "meilisearch",
      query: "colegio"
    });
    expect(searchIndexServiceMock.search).toHaveBeenCalledWith(query);
  });

  it("falls back to postgres search when index fails", async () => {
    (searchIndexServiceMock.search as jest.Mock).mockRejectedValue(new Error("meili down"));
    (schoolsServiceMock.searchSchools as jest.Mock).mockResolvedValue({
      items: [{ id: "2", name: "Fallback School" }],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1, hasNextPage: false }
    });

    const result = await service.search(query);

    expect(result).toMatchObject({
      engine: "postgres_fallback",
      query: "colegio"
    });
    expect(schoolsServiceMock.searchSchools).toHaveBeenCalledWith(query);
  });

  it("rethrows BadRequestException from search layer", async () => {
    (searchIndexServiceMock.search as jest.Mock).mockRejectedValue(new BadRequestException("invalid"));

    await expect(service.search(query)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("invalidates dependent namespaces after reindex", async () => {
    (searchIndexServiceMock.reindexSchools as jest.Mock).mockResolvedValue({
      indexedSchools: 3
    });

    await service.reindex();

    expect(cacheMock.invalidateMany).toHaveBeenCalledWith([
      "search",
      "schools:list",
      "schools:search",
      "schools:detail",
      "rankings",
      "insights"
    ]);
  });
});
