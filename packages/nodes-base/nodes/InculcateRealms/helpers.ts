import { createHash } from 'crypto';

import type { GateChecklistEntry, RealmsTheory, WorkerClass } from './types';

// Deterministic, offline-only utilities. No randomness, no clock reads, no
// network. Given identical inputs every helper returns identical output so the
// node is replayable inside the Studio Decision Graph.

/** Lowercase, hyphenated, ASCII-safe slug. Falls back to a stable token. */
export function slugify(input: string, fallback = 'untitled'): string {
	const slug = input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
	return slug.length > 0 ? slug : fallback;
}

/** Short deterministic fingerprint derived from arbitrary input. */
export function fingerprint(input: string, length = 8): string {
	return createHash('sha256').update(input).digest('hex').slice(0, length);
}

/**
 * Structured, prefix-namespaced ID derived safely from a seed/title. The hash
 * suffix keeps IDs unique without leaking unsafe characters that could be used
 * as computed object keys downstream.
 */
export function structuredId(prefix: string, seed: string, salt = ''): string {
	return `${prefix}_${fingerprint(`${prefix}:${seed}:${salt}`)}`;
}

/** Derive a human-readable working title from a free-text seed. */
export function deriveTitle(seed: string): string {
	const cleaned = seed.replace(/\s+/g, ' ').trim();
	if (cleaned.length === 0) return 'Untitled Realm';
	const firstClause = cleaned.split(/[.!?\n]/)[0].trim();
	const words = firstClause.split(' ').slice(0, 7);
	const title = words
		.map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
		.join(' ');
	return title.length > 0 ? title : 'Untitled Realm';
}

/** Significant keywords extracted deterministically (stable order, deduped). */
export function keywords(seed: string, max = 6): string[] {
	const stop = new Set([
		'the',
		'a',
		'an',
		'and',
		'or',
		'but',
		'of',
		'to',
		'in',
		'on',
		'for',
		'with',
		'is',
		'are',
		'was',
		'were',
		'be',
		'as',
		'at',
		'by',
		'it',
		'this',
		'that',
		'who',
		'what',
		'when',
		'where',
		'why',
		'how',
		'about',
		'into',
		'from',
	]);
	const seen = new Set<string>();
	const result: string[] = [];
	for (const raw of seed.toLowerCase().split(/[^a-z0-9]+/)) {
		if (raw.length < 4 || stop.has(raw) || seen.has(raw)) continue;
		seen.add(raw);
		result.push(raw);
		if (result.length >= max) break;
	}
	return result;
}

/** Trim a free-text seed into a single provisional sentence. */
export function firstSentence(seed: string): string {
	const cleaned = seed.replace(/\s+/g, ' ').trim();
	if (cleaned.length === 0) return '';
	const sentence = cleaned.split(/(?<=[.!?])\s/)[0].trim();
	return sentence.length > 0 ? sentence : cleaned;
}

/** The canonical Realms product theory. Stable across all calls. */
export function realmsTheory(): RealmsTheory {
	return {
		studioDirector:
			'One Studio Director (the human) directs screen-IP development; internal RolePolicies execute under that direction and never act without inspectable provenance.',
		artifactCanvas:
			'An auto-generated Artifact Canvas is the primary work surface: typed nodes (charter, kernel, ledger, bible, scenes, decisions) with explicit edges, state, and human interaction semantics.',
		projectVault:
			'A local-first Project Vault holds human-readable files plus machine state with hashes and indexes; chat history is never treated as storage and data egress is explicit.',
		decisionGraph:
			'A Studio Decision Graph records why each choice was made and what happened afterward, making the development process defensible and replayable.',
		humanGates:
			'Human gates control high-leverage authorial decisions and all locks; gate dispositions are explicit, evidence-backed, and replayable.',
		rolePolicyLibrary:
			'A versioned RolePolicy library configures a small set of runtime worker classes with domain instructions, tools, schemas, authority, and evaluation profiles.',
		stageContracts:
			'Stage Contracts define the typed inputs, outputs, gate, and failure modes for each development stage so progress is verifiable rather than narrative.',
	};
}

/** v1 worker-class catalogue (six execution classes). */
export const WORKER_CLASSES: WorkerClass[] = [
	'PlannerRouter',
	'CreativeWorker',
	'ResearchWorker',
	'CriticWorker',
	'CompilerWorker',
	'GovernanceWorker',
];

/** The seven canonical human gates used across the development ladder. */
export function canonicalGates(projectSeed: string): GateChecklistEntry[] {
	const defs: Array<{
		key: string;
		name: string;
		stage: string;
		authority: string;
		criteria: string[];
	}> = [
		{
			key: 'intake',
			name: 'Charter Approval',
			stage: 'Stage 0 — Intake & Project Charter',
			authority: 'Studio Director',
			criteria: [
				'Seed and intent are captured',
				'Format, runtime, and route-to-market are set',
				'Constraints are explicit',
			],
		},
		{
			key: 'evidence',
			name: 'Evidence Ledger Sign-off',
			stage: 'Stage 2 — Adaptive Research & Evidence Ledger',
			authority: 'Studio Director',
			criteria: [
				'Key unknowns have cited evidence',
				'Source provenance is recorded',
				'Open risks are dispositioned',
			],
		},
		{
			key: 'kernel',
			name: 'Story Kernel Lock',
			stage: 'Stage 3 — Story Kernel',
			authority: 'Studio Director',
			criteria: [
				'Premise is no longer provisional',
				'Central tension is defined',
				'Thematic question is committed',
			],
		},
		{
			key: 'bible',
			name: 'Creative Bible Approval',
			stage: 'Stage 4 — Creative Room Foundations',
			authority: 'Studio Director',
			criteria: [
				'World and culture are coherent',
				'Character set is justified',
				'Visual/sonic grammar is defined',
			],
		},
		{
			key: 'architecture',
			name: 'Story Architecture Approval',
			stage: 'Stage 5 — Story Architecture',
			authority: 'Studio Director',
			criteria: [
				'Sequence map is complete',
				'Each beat has a dramatic purpose',
				'No structural redundancy',
			],
		},
		{
			key: 'scenes',
			name: 'Treatment & Scenes Approval',
			stage: 'Stage 6 — Treatment & Scene Cards',
			authority: 'Studio Director',
			criteria: [
				'Every scene has a SceneCard',
				'Each scene carries a turn',
				'No missing or redundant scenes',
			],
		},
		{
			key: 'scriptlock',
			name: 'Script Lock',
			stage: 'Stage 11 — Script Lock',
			authority: 'Human Lock Authority',
			criteria: [
				'Draft is approved',
				'Notes are resolved or deferred with rationale',
				'Change policy is acknowledged',
			],
		},
	];

	return defs.map((def) => ({
		gateId: structuredId('gate', projectSeed, def.key),
		name: def.name,
		stage: def.stage,
		authority: def.authority,
		status: 'pending' as const,
		criteria: def.criteria.map((requirement, index) => ({
			id: structuredId('crit', projectSeed, `${def.key}-${index}`),
			requirement,
		})),
	}));
}

/**
 * Parse a parameter that may be a JSON string or already an object. Returns
 * `undefined` when the value is empty so callers can decide whether the field
 * was optional. Throws (caller wraps into NodeOperationError) on malformed JSON.
 */
export function tryParseJson(value: unknown): { parsed: unknown; wasJson: boolean } {
	if (value === null || value === undefined) return { parsed: undefined, wasJson: false };
	if (typeof value === 'object') return { parsed: value, wasJson: true };
	if (typeof value !== 'string') return { parsed: value, wasJson: false };
	const trimmed = value.trim();
	if (trimmed.length === 0) return { parsed: undefined, wasJson: false };
	if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
		return { parsed: value, wasJson: false };
	}
	const parsed: unknown = JSON.parse(trimmed);
	return { parsed, wasJson: true };
}

/** Split a comma/newline separated list into trimmed, non-empty entries. */
export function splitList(value: string): string[] {
	return value
		.split(/[,\n]/)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

/** Read a string field from an untrusted parsed object without unsafe access. */
export function readStringField(source: unknown, field: string): string | undefined {
	if (source === null || typeof source !== 'object') return undefined;
	const value = (source as Record<string, unknown>)[field];
	return typeof value === 'string' ? value : undefined;
}

/** Stable JSON stringification with sorted object keys for reproducible hashes. */
export function canonicalizeJson(value: unknown): string {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((entry) => canonicalizeJson(entry)).join(',')}]`;
	const record = value as Record<string, unknown>;
	return `{${Object.keys(record)
		.sort()
		.map((key) => `${JSON.stringify(key)}:${canonicalizeJson(record[key])}`)
		.join(',')}}`;
}

/** SHA-256 hash over canonical JSON, suitable for artifact content hashes. */
export function sha256Canonical(value: unknown): string {
	return `sha256:${createHash('sha256').update(canonicalizeJson(value)).digest('hex')}`;
}
