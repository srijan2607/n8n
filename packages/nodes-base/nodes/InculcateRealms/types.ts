// Typed contracts for the in.culcate Realms node.
// These interfaces describe the deterministic studio artifacts produced by the
// node operations. They intentionally mirror the vocabulary of the in.culcate
// Studio OS / Script Intelligence PRDs (Project Charter, Story Kernel, Evidence
// Ledger, Creative Bible, Scene Cards, Decision Graph, Script Lock, Stage
// Contracts, RolePolicy library) so downstream automation can rely on a stable
// shape.

export type RealmsOperation =
	| 'createProjectCharter'
	| 'buildDevelopmentPlan'
	| 'compileRealmPackage'
	| 'generateArtifactPack'
	| 'evaluateGate';

export type ProductionMode = 'liveAction' | 'animation' | 'hybrid' | 'aiAssisted';

export type RouteToMarket = 'theatrical' | 'streaming' | 'broadcast' | 'social' | 'festival';

export type ScreenFormat = 'feature' | 'series' | 'short' | 'branded' | 'documentary' | 'micro';

export type SourceMode = 'original' | 'adaptation' | 'ipExtension' | 'brandBrief';

export type ResearchDepth = 'light' | 'standard' | 'deep';

export type PackageDepth = 'skeleton' | 'standard' | 'full';

export type Strictness = 'lenient' | 'standard' | 'strict';

export type GateDecision = 'REQUEST_MORE' | 'REVISE' | 'APPROVE' | 'HOLD';

// The six runtime worker classes. PRDs collapse ~82 named roles into a small set
// of execution classes; these are the v1 inference used across the node.
export type WorkerClass =
	| 'PlannerRouter'
	| 'CreativeWorker'
	| 'ResearchWorker'
	| 'CriticWorker'
	| 'CompilerWorker'
	| 'GovernanceWorker';

export interface CharterInput {
	seed: string;
	format: ScreenFormat;
	runtimeMinutes: number;
	language: string;
	audience: string;
	routeToMarket: RouteToMarket;
	productionMode: ProductionMode;
	constraints: string[];
}

export interface GovernancePrinciple {
	id: string;
	principle: string;
}

export interface ProjectCharter {
	projectId: string;
	title: string;
	seed: string;
	format: ScreenFormat;
	runtimeMinutes: number;
	language: string;
	audience: string;
	routeToMarket: RouteToMarket;
	productionMode: ProductionMode;
	constraints: string[];
	stage: string;
	studioDirector: StudioDirector;
	governance: GovernancePrinciple[];
}

export interface StudioDirector {
	role: string;
	authority: string;
	description: string;
}

export interface StoryKernel {
	kernelId: string;
	provisional: boolean;
	premise: string;
	protagonistHypothesis: string;
	centralTension: string;
	thematicQuestion: string;
	toneKeywords: string[];
}

export interface UnknownEntry {
	id: string;
	question: string;
	category: string;
	severity: 'low' | 'medium' | 'high';
	status: 'open';
}

export interface GateCriterion {
	id: string;
	requirement: string;
}

export interface GateChecklistEntry {
	gateId: string;
	name: string;
	stage: string;
	authority: string;
	status: 'pending';
	criteria: GateCriterion[];
}

export interface CreateProjectCharterResult {
	projectCharter: ProjectCharter;
	storyKernel: StoryKernel;
	unknownsRegister: UnknownEntry[];
	gateChecklist: GateChecklistEntry[];
}

export interface RealmsTheory {
	studioDirector: string;
	artifactCanvas: string;
	projectVault: string;
	decisionGraph: string;
	humanGates: string;
	rolePolicyLibrary: string;
	stageContracts: string;
}

export interface Assumption {
	id: string;
	statement: string;
	confidence: 'low' | 'medium' | 'high';
}

export interface MilestoneTicket {
	id: string;
	title: string;
	stage: string;
	dependsOn: string[];
	deliverable: string;
}

export interface FormatPolicyPack {
	packId: string;
	format: ScreenFormat;
	mandatoryArtifacts: string[];
	structuralDefault: string;
	hookCadenceSeconds: number;
	targetLengthMinutes: number;
	gateCount: number;
	evaluationWeights: Record<string, number>;
}

export interface RolePolicyEntry {
	roleId: string;
	name: string;
	workerClass: WorkerClass;
	room: string;
	producesArtifact: string;
	authority: string;
}

export interface StageContract {
	stageId: string;
	name: string;
	inputs: string[];
	outputs: string[];
	gate: string;
	failureModes: string[];
}

export interface BuildDevelopmentPlanResult {
	realmsTheory: RealmsTheory;
	assumptions: Assumption[];
	milestoneTickets: MilestoneTicket[];
	formatPolicyPack: FormatPolicyPack;
	rolePolicyRoster: RolePolicyEntry[];
	stageContracts: StageContract[];
}

export interface DevelopmentHeader {
	packageId: string;
	projectId: string;
	projectTitle: string;
	seed: string;
	packageDepth: PackageDepth;
	skill: string;
	generatedStage: string;
}

export interface StoryMaterials {
	premise: string;
	logline: string;
	synopsisSkeleton: string[];
	themeStatement: string;
	toneKeywords: string[];
}

export interface EvidenceLedgerTemplate {
	ledgerId: string;
	columns: string[];
	entryTemplate: Record<string, string>;
	citationPolicy: string;
}

export interface CreativeBibleTemplate {
	bibleId: string;
	sections: string[];
	worldFields: string[];
	characterFields: string[];
}

export interface SequenceMapTemplate {
	mapId: string;
	structureModel: string;
	beats: Array<{ id: string; label: string; purpose: string }>;
}

export interface SceneCardTemplate {
	cardId: string;
	fields: string[];
	example: Record<string, string>;
}

export interface DecisionLedgerEntry {
	decisionId: string;
	question: string;
	options: string[];
	status: 'open';
	owner: string;
}

export interface ScriptLockRequirements {
	lockId: string;
	requirements: string[];
	changePolicy: string;
}

export interface NarrativeCompilerHandoff {
	handoffId: string;
	studioIrFields: string[];
	regenerableUnits: string[];
	note: string;
}

export interface CompileRealmPackageResult {
	developmentHeader: DevelopmentHeader;
	storyMaterials: StoryMaterials;
	evidenceLedgerTemplate: EvidenceLedgerTemplate;
	creativeBibleTemplate: CreativeBibleTemplate;
	sequenceMapTemplate: SequenceMapTemplate;
	sceneCardTemplate: SceneCardTemplate;
	decisionLedger: DecisionLedgerEntry[];
	scriptLockRequirements: ScriptLockRequirements;
	narrativeCompilerHandoff: NarrativeCompilerHandoff;
}

export interface GateBlocker {
	id: string;
	missingField: string;
	reason: string;
}

export interface GateRisk {
	id: string;
	field: string;
	note: string;
}

export interface GateNextAction {
	id: string;
	action: string;
}

export interface EvaluateGateResult {
	gateName: string;
	decision: GateDecision;
	score: number;
	confidence: number;
	strictness: Strictness;
	hardBlockers: GateBlocker[];
	softRisks: GateRisk[];
	nextActions: GateNextAction[];
	summary: string;
}

export type ArtifactPackFormatPolicy =
	| 'short_film_v1'
	| 'branded_short_v1'
	| 'microdrama_v1'
	| 'feature_v1'
	| 'series_v1';

export interface ArtifactPackInput {
	seed: string;
	realmName: string;
	format: ScreenFormat;
	runtimeMinutes: number;
	language: string;
	audience: string;
	allowWebResearch: boolean;
	maxLocations: number;
	maxPrincipalCharacters: number;
}

export interface ArtifactVersionEnvelope {
	artifactVersionId: string;
	artifactId: string;
	projectId: string;
	type: string;
	version: number;
	status: 'generated' | 'blocked';
	contentHash: string;
	sourceVersionIds: string[];
	createdBy: {
		type: 'deterministic_realms_node';
		workflow: 'inculcateRealms.generateArtifactPack';
	};
}

export interface GenerateArtifactPackResult {
	projectId: string;
	formatPolicyId: ArtifactPackFormatPolicy;
	status: 'generated_mock_artifact_pack';
	artifacts: Record<string, unknown>;
	artifactVersions: ArtifactVersionEnvelope[];
	schemas: Record<string, unknown>;
	exportPackage: Record<string, unknown>;
	checksums: Record<string, string>;
	openGates: string[];
	validationSummary: {
		hardErrors: string[];
		warnings: string[];
	};
}
