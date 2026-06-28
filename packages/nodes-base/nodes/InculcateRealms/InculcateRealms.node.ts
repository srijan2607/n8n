import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	buildDevelopmentPlanFields,
	compileRealmPackageFields,
	createProjectCharterFields,
	generateArtifactPackFields,
	evaluateGateFields,
	operationProperty,
} from './descriptions';
import { readStringField, splitList, tryParseJson } from './helpers';
import {
	buildDevelopmentPlan,
	compileRealmPackage,
	createProjectCharter,
	generateArtifactPack,
	evaluateGate,
} from './operations';
import type {
	ProductionMode,
	RealmsOperation,
	ResearchDepth,
	RouteToMarket,
	ScreenFormat,
	SourceMode,
	Strictness,
} from './types';

const FORMATS: ScreenFormat[] = ['feature', 'series', 'short', 'branded', 'documentary', 'micro'];
const ROUTES: RouteToMarket[] = ['theatrical', 'streaming', 'broadcast', 'social', 'festival'];
const MODES: ProductionMode[] = ['liveAction', 'animation', 'hybrid', 'aiAssisted'];
const SOURCE_MODES: SourceMode[] = ['original', 'adaptation', 'ipExtension', 'brandBrief'];
const RESEARCH_DEPTHS: ResearchDepth[] = ['light', 'standard', 'deep'];
const STRICTNESS: Strictness[] = ['lenient', 'standard', 'strict'];

/** Narrow an untrusted parameter string to a known union, falling back safely. */
function narrow<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
	return allowed.includes(value as T) ? (value as T) : fallback;
}

export class InculcateRealms implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'in.culcate Realms',
		name: 'inculcateRealms',
		icon: 'file:inculcateRealms.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Governed screen-IP studio operations: convert a seed/brief into Project Charter, development plan, studio package, and gate evaluations — deterministic and offline',
		defaults: {
			name: 'in.culcate Realms',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			operationProperty,
			...createProjectCharterFields,
			...buildDevelopmentPlanFields,
			...compileRealmPackageFields,
			...generateArtifactPackFields,
			...evaluateGateFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as RealmsOperation;

		const getString = (name: string, i: number, fallback = ''): string => {
			const value = this.getNodeParameter(name, i, fallback);
			return typeof value === 'string' ? value : String(value ?? fallback);
		};

		for (let i = 0; i < items.length; i++) {
			try {
				let result: IDataObject;

				if (operation === 'createProjectCharter') {
					const seed = getString('seed', i);
					if (seed.trim().length === 0) {
						throw new NodeOperationError(this.getNode(), 'Seed / Brief is required', {
							itemIndex: i,
						});
					}
					const runtimeRaw = this.getNodeParameter('runtimeMinutes', i, 100);
					result = createProjectCharter({
						seed,
						format: narrow(getString('format', i, 'feature'), FORMATS, 'feature'),
						runtimeMinutes: typeof runtimeRaw === 'number' ? runtimeRaw : Number(runtimeRaw) || 100,
						language: getString('language', i, 'en'),
						audience: getString('audience', i),
						routeToMarket: narrow(getString('routeToMarket', i, 'streaming'), ROUTES, 'streaming'),
						productionMode: narrow(
							getString('productionMode', i, 'liveAction'),
							MODES,
							'liveAction',
						),
						constraints: splitList(getString('constraints', i)),
					}) as unknown as IDataObject;
				} else if (operation === 'buildDevelopmentPlan') {
					const raw = getString('charterOrSeed', i);
					if (raw.trim().length === 0) {
						throw new NodeOperationError(this.getNode(), 'Charter JSON or Seed is required', {
							itemIndex: i,
						});
					}
					let seed = raw;
					let formatFromCharter: string | undefined;
					try {
						const { parsed, wasJson } = tryParseJson(raw);
						if (wasJson) {
							// Accept either a charter object or a nested { projectCharter: {...} }.
							const charter = readStringField(parsed, 'seed')
								? parsed
								: (parsed as { projectCharter?: unknown })?.projectCharter;
							const parsedSeed = readStringField(charter, 'seed');
							if (parsedSeed) seed = parsedSeed;
							formatFromCharter = readStringField(charter, 'format');
						}
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							`Could not parse "Charter JSON or Seed" as JSON: ${(error as Error).message}`,
							{ itemIndex: i },
						);
					}
					const format = narrow(
						formatFromCharter ?? getString('format', i, 'feature'),
						FORMATS,
						'feature',
					);
					result = buildDevelopmentPlan({
						seed,
						format,
						sourceMode: narrow(getString('sourceMode', i, 'original'), SOURCE_MODES, 'original'),
						researchDepth: narrow(
							getString('researchDepth', i, 'standard'),
							RESEARCH_DEPTHS,
							'standard',
						),
						targetBenchmark: getString('targetBenchmark', i),
					}) as unknown as IDataObject;
				} else if (operation === 'compileRealmPackage') {
					const seed = getString('seed', i);
					if (seed.trim().length === 0) {
						throw new NodeOperationError(this.getNode(), 'Seed / Brief is required', {
							itemIndex: i,
						});
					}
					result = compileRealmPackage({
						seed,
						projectTitle: getString('projectTitle', i),
						packageDepth: narrow(
							getString('packageDepth', i, 'standard'),
							['skeleton', 'standard', 'full'] as const,
							'standard',
						),
					}) as unknown as IDataObject;
				} else if (operation === 'generateArtifactPack') {
					const seed = getString('seed', i);
					if (seed.trim().length === 0) {
						throw new NodeOperationError(this.getNode(), 'Seed / Brief is required', {
							itemIndex: i,
						});
					}
					const runtimeRaw = this.getNodeParameter('runtimeMinutes', i, 10);
					const maxLocationsRaw = this.getNodeParameter('maxLocations', i, 3);
					const maxCharactersRaw = this.getNodeParameter('maxPrincipalCharacters', i, 4);
					result = generateArtifactPack({
						seed,
						realmName: getString('realmName', i),
						format: narrow(getString('format', i, 'short'), FORMATS, 'short'),
						runtimeMinutes: typeof runtimeRaw === 'number' ? runtimeRaw : Number(runtimeRaw) || 10,
						language: getString('language', i, 'English'),
						audience: getString('audience', i),
						allowWebResearch: this.getNodeParameter('allowWebResearch', i, false) as boolean,
						maxLocations:
							typeof maxLocationsRaw === 'number' ? maxLocationsRaw : Number(maxLocationsRaw) || 3,
						maxPrincipalCharacters:
							typeof maxCharactersRaw === 'number'
								? maxCharactersRaw
								: Number(maxCharactersRaw) || 4,
					}) as unknown as IDataObject;
				} else if (operation === 'evaluateGate') {
					const artifactText = getString('artifact', i);
					let artifact: unknown = artifactText;
					let isStructured = false;
					try {
						const { parsed, wasJson } = tryParseJson(artifactText);
						artifact = parsed;
						isStructured = wasJson;
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							`Artifact looks like JSON but could not be parsed: ${(error as Error).message}`,
							{ itemIndex: i },
						);
					}
					result = evaluateGate({
						gateName: getString('gateName', i, 'Generic'),
						artifact,
						artifactText,
						isStructured,
						strictness: narrow(getString('strictness', i, 'standard'), STRICTNESS, 'standard'),
					}) as unknown as IDataObject;
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${String(operation)}`, {
						itemIndex: i,
					});
				}

				returnData.push({ json: result, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
