export type SkillStatus = "candidate" | "active" | "deprecated";

export interface SkillSource {
  type: "git";
  repo: string;
  path: string;
  ref: string;
  pinned_commit?: string;
}

export interface Skill {
  id: string;
  name: string;
  summary: string;
  platforms: string[];
  content_types: string[];
  formats: string[];
  source: SkillSource;
  license?: string;
  sync: boolean;
  status: SkillStatus;
}

export interface Catalog {
  skills: Skill[];
}

export interface TaxonomyEntry {
  label: string;
}

export interface Taxonomy {
  platforms: Record<string, TaxonomyEntry>;
  content_types: Record<string, TaxonomyEntry>;
  formats: Record<string, TaxonomyEntry>;
}

export interface StarRecord {
  stars: number;
  fetched_at: string;
}

export type StarsCache = Record<string, StarRecord>;

export interface RejectedEntry {
  repo: string;
  path: string;
  reason: string;
  rejected_at: string;
}

export interface RejectedCatalog {
  rejected: RejectedEntry[];
}

export interface SeenEntry {
  key: string;
  notified_at: string;
  issue_url?: string;
}

export interface SeenCatalog {
  seen: SeenEntry[];
}

export interface Candidate {
  id: string;
  name: string;
  summary: string;
  repo: string;
  path: string;
  ref?: string;
  license?: string;
  reason: string;
  sourceKind: "github-search" | "skills.sh" | "awesome-list";
  stars?: number;
  url?: string;
}
