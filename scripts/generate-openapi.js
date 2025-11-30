#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const servicesDir = path.join(rootDir, 'src', 'api', 'services');
const schemasEntryPath = path.join(
  rootDir,
  'src',
  'api',
  'schemas',
  'index.js'
);
const schemasDir = path.dirname(schemasEntryPath);
const outputDir = path.join(rootDir, 'shared', 'api', 'generated');
const openApiOutputPath = path.join(outputDir, 'openapi.json');
const helperOutputPath = path.join(outputDir, 'endpoints.js');

fs.mkdirSync(outputDir, { recursive: true });

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

const serviceFiles = fs
  .readdirSync(servicesDir)
  .filter((file) => file.endsWith('.js'))
  .sort();

await main().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function main() {
  const operations = [];

  for (const fileName of serviceFiles) {
    const filePath = path.join(servicesDir, fileName);
    const source = fs.readFileSync(filePath, 'utf8');

    const ast = parse(source, {
      sourceType: 'module',
      sourceFilename: fileName,
      plugins: [
        'jsx',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
        'objectRestSpread',
        'dynamicImport',
        'topLevelAwait',
      ],
    });

    const serviceName = fileName.replace(/\.js$/, '');

    traverse(ast, {
      CallExpression(callPath) {
        const callee = callPath.node.callee;
        if (!t.isMemberExpression(callee)) return;
        if (!t.isIdentifier(callee.object, { name: 'apiClient' })) return;
        if (!t.isIdentifier(callee.property)) return;

        const method = callee.property.name.toLowerCase();
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) return;
        if (callPath.node.arguments.length === 0) return;

        const endpointArg = callPath.node.arguments[0];
        const endpointInfo = extractEndpoint(endpointArg, callPath, new Set());
        if (!endpointInfo) return;

        const functionName = resolveOperationName(callPath);
        const loc = callPath.node.loc
          ? {
              line: callPath.node.loc.start.line,
              column: callPath.node.loc.start.column + 1,
            }
          : null;

        operations.push({
          method,
          service: serviceName,
          functionName,
          file: `src/api/services/${fileName}`,
          path: endpointInfo.path,
          pathSegments: endpointInfo.segments,
          pathParams: endpointInfo.params,
          rawExpression: endpointInfo.raw,
          loc,
        });
      },
    });
  }

  if (operations.length === 0) {
    console.warn(
      'No apiClient operations discovered. Ensure services are authored as expected.'
    );
  }

  operations.sort((a, b) => {
    if (a.path === b.path) {
      if (a.method === b.method) {
        return (a.functionName || '').localeCompare(b.functionName || '');
      }
      return a.method.localeCompare(b.method);
    }
    return a.path.localeCompare(b.path);
  });

  const usedOperationIds = new Set();
  for (const op of operations) {
    const baseId = buildOperationIdBase(op);
    let candidate = baseId;
    let counter = 1;
    while (usedOperationIds.has(candidate)) {
      counter += 1;
      candidate = `${baseId}_${counter}`;
    }
    usedOperationIds.add(candidate);
    op.operationId = candidate;
  }

  const openApiDoc = await buildOpenApiDocument(operations);
  fs.writeFileSync(
    openApiOutputPath,
    `${JSON.stringify(openApiDoc, null, 2)}\n`,
    'utf8'
  );

  const helperSource = buildHelperModule(operations);
  fs.writeFileSync(helperOutputPath, helperSource, 'utf8');

  console.log(
    `Generated OpenAPI spec at ${path.relative(rootDir, openApiOutputPath)}`
  );
  console.log(
    `Generated endpoint helpers at ${path.relative(rootDir, helperOutputPath)}`
  );
}

function extractEndpoint(node, callPath, seen) {
  if (!node) return null;

  if (t.isStringLiteral(node)) {
    const normalized = normalizePath(node.value);
    return {
      path: normalized,
      segments: [{ type: 'literal', value: normalized, isQuery: false }],
      params: [],
      raw: node.value,
    };
  }

  if (t.isTemplateLiteral(node)) {
    const segments = [];
    const params = [];
    let composedPath = '';

    node.quasis.forEach((quasi, index) => {
      const literalValue = quasi.value.cooked || '';
      if (literalValue) {
        segments.push({ type: 'literal', value: literalValue, isQuery: false });
        composedPath += literalValue;
      }

      if (index < node.expressions.length) {
        const expr = node.expressions[index];
        const expressionCode = generate(expr).code;
        const paramName = deriveParamName(expr, index);
        const lastSegment = segments[segments.length - 1];
        const precedingLiteral =
          lastSegment && lastSegment.type === 'literal'
            ? lastSegment.value
            : '';
        const isQuerySegment =
          precedingLiteral.includes('?') || precedingLiteral.includes('&');
        if (!isQuerySegment) {
          params.push(paramName);
        }
        segments.push({
          type: 'param',
          name: paramName,
          expression: expressionCode,
          isQuery: isQuerySegment,
        });
        composedPath += `{${paramName}}`;
      }
    });

    if (!composedPath.startsWith('/')) {
      composedPath = `/${composedPath}`;
      if (segments.length === 0 || segments[0].type !== 'literal') {
        segments.unshift({ type: 'literal', value: '/' });
      } else {
        segments[0] = {
          ...segments[0],
          value: `/${segments[0].value}`,
        };
      }
    }

    const pathOnly = composedPath.split('?')[0];

    return {
      path: normalizePath(pathOnly),
      segments,
      params,
      raw: generate(node).code,
    };
  }

  if (t.isIdentifier(node)) {
    if (seen.has(node.name)) return null;
    seen.add(node.name);
    const binding = callPath.scope.getBinding(node.name);
    if (binding && binding.path && binding.path.node) {
      const bindingNode = binding.path.node;
      if (t.isVariableDeclarator(bindingNode) && bindingNode.init) {
        return extractEndpoint(bindingNode.init, binding.path, seen);
      }
      if (t.isFunctionDeclaration(bindingNode) && bindingNode.body) {
        const returned = findReturnedExpression(bindingNode.body);
        if (returned) {
          return extractEndpoint(returned, binding.path, seen);
        }
      }
    }
  }

  if (t.isBinaryExpression(node) && node.operator === '+') {
    const left = extractEndpoint(node.left, callPath, seen);
    const right = extractEndpoint(node.right, callPath, seen);
    if (left && right) {
      const combinedSegments = [
        ...left.segments.map(cloneSegment),
        ...right.segments.map(cloneSegment),
      ];
      const combinedParams = [...left.params, ...right.params];
      const combinedPath = composePathFromSegments(combinedSegments);
      return {
        path: combinedPath,
        segments: combinedSegments,
        params: combinedParams,
        raw: `${left.raw || ''} + ${right.raw || ''}`,
      };
    }
  }

  return null;
}

function resolveOperationName(callPath) {
  const fnPath = callPath.getFunctionParent();
  if (!fnPath) return null;

  if (fnPath.isFunctionDeclaration() && fnPath.node.id) {
    return fnPath.node.id.name;
  }

  if (fnPath.isClassMethod() || fnPath.isObjectMethod()) {
    const key = fnPath.node.key;
    if (t.isIdentifier(key)) return key.name;
    if (t.isStringLiteral(key)) return key.value;
  }

  if (fnPath.isFunctionExpression() || fnPath.isArrowFunctionExpression()) {
    const parent = fnPath.parentPath;
    if (
      parent &&
      parent.isVariableDeclarator() &&
      t.isIdentifier(parent.node.id)
    ) {
      return parent.node.id.name;
    }
    if (
      parent &&
      parent.isAssignmentExpression() &&
      t.isIdentifier(parent.node.left)
    ) {
      return parent.node.left.name;
    }
  }

  return null;
}

function deriveParamName(expr, index) {
  if (t.isIdentifier(expr)) {
    return expr.name;
  }
  if (t.isMemberExpression(expr)) {
    if (!expr.computed && t.isIdentifier(expr.property)) {
      return expr.property.name;
    }
    if (expr.computed && t.isStringLiteral(expr.property)) {
      return expr.property.value;
    }
  }
  return `param${index + 1}`;
}

function findReturnedExpression(body) {
  if (!t.isBlockStatement(body)) return null;
  for (const statement of body.body) {
    if (t.isReturnStatement(statement) && statement.argument) {
      return statement.argument;
    }
  }
  return null;
}

function normalizePath(value) {
  if (!value) return '/';
  let normalized = value.trim();
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }
  normalized = normalized.replace(/\/{2,}/g, '/');
  return normalized || '/';
}

function cloneSegment(segment) {
  if (segment.type === 'literal') {
    return {
      type: 'literal',
      value: segment.value,
      isQuery: Boolean(segment.isQuery),
    };
  }
  return {
    type: 'param',
    name: segment.name,
    expression: segment.expression,
    isQuery: Boolean(segment.isQuery),
  };
}

function composePathFromSegments(segments) {
  let raw = '';
  segments.forEach((segment) => {
    if (segment.type === 'literal') {
      raw += segment.value;
    } else if (segment.type === 'param') {
      raw += `{${segment.name}}`;
    }
  });
  const pathOnly = raw.split('?')[0];
  return normalizePath(pathOnly);
}

function buildOperationIdBase(op) {
  const serviceSlug = op.service.replace(/Service$/, '');
  const rawName = op.functionName || `${op.method}_${op.path}`;
  let candidate = `${serviceSlug}_${rawName}`
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  if (!candidate) {
    candidate = `${serviceSlug}_${op.method}`;
  }
  return candidate;
}

async function buildOpenApiDocument(ops) {
  const paths = {};

  ops.forEach((op) => {
    if (!paths[op.path]) {
      paths[op.path] = {};
    }
    const methodEntry = {
      operationId: op.operationId,
      summary: `Generated from ${op.file}${op.functionName ? `#${op.functionName}` : ''}`,
      tags: [op.service],
      responses: {
        default: {
          description: 'Auto-generated response placeholder',
        },
      },
    };

    if (op.pathParams.length > 0) {
      methodEntry.parameters = op.pathParams.map((name) => ({
        name,
        in: 'path',
        required: true,
        schema: { type: 'string' },
      }));
    }

    if (['post', 'put', 'patch'].includes(op.method)) {
      methodEntry.requestBody = {
        description: 'Auto-generated placeholder body',
        required: false,
      };
    }

    paths[op.path][op.method] = methodEntry;
  });

  const sortedPaths = Object.keys(paths)
    .sort()
    .reduce((acc, key) => {
      const methods = paths[key];
      const sortedMethods = Object.keys(methods)
        .sort()
        .reduce((methodAcc, methodKey) => {
          methodAcc[methodKey] = methods[methodKey];
          return methodAcc;
        }, {});
      acc[key] = sortedMethods;
      return acc;
    }, {});

  const schemas = await buildSchemaComponents();

  return {
    openapi: '3.1.0',
    info: {
      title: 'Technomart API (auto-generated)',
      version: '1.0.0',
      description:
        'This OpenAPI document is generated from the existing JavaScript service layer. Update via `npm run generate:openapi` after modifying services or schemas.',
    },
    paths: sortedPaths,
    components: {
      schemas,
    },
  };
}

async function buildSchemaComponents() {
  const schemas = {};
  const tempDir = fs.mkdtempSync(path.join(outputDir, 'schemas-tmp-'));
  const schemaFiles = fs
    .readdirSync(schemasDir)
    .filter((file) => file.endsWith('.js') && file !== 'index.js');

  try {
    const allSchemaFiles = fs
      .readdirSync(schemasDir)
      .filter((file) => file.endsWith('.js'));
    for (const file of allSchemaFiles) {
      const sourcePath = path.join(schemasDir, file);
      let content = fs.readFileSync(sourcePath, 'utf8');
      content = content.replace(
        /from\s+['"](\.[^'"]*)['"]/g,
        (match, specifier) => {
          const ext = path.extname(specifier);
          if (ext) return match;
          return match.replace(specifier, `${specifier}.js`);
        }
      );
      fs.writeFileSync(path.join(tempDir, file), content, 'utf8');
    }

    for (const file of schemaFiles) {
      try {
        const moduleUrl = pathToFileURL(path.join(tempDir, file)).href;
        const moduleExports = await import(moduleUrl);
        for (const [key, value] of Object.entries(moduleExports)) {
          if (value instanceof z.ZodType && !schemas[key]) {
            const jsonSchema = zodToJsonSchema(value, key, {
              target: 'openApi3',
            });
            schemas[key] = jsonSchema;
          }
        }
      } catch (err) {
        console.warn(
          `Skipping schema file ${file} due to import error: ${err.message}`
        );
      }
    }
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
  return schemas;
}

function buildHelperModule(ops) {
  const lines = [];
  lines.push(
    '// Auto-generated by scripts/generate-openapi.js. Do not edit manually.'
  );
  lines.push('/* eslint-disable */');
  lines.push("import apiClient from '../client.js';");
  lines.push('');
  lines.push('export const operations = {');

  ops.forEach((op) => {
    const entryLines = [];
    entryLines.push(`  ${JSON.stringify(op.operationId)}: {`);
    entryLines.push(`    method: ${JSON.stringify(op.method)},`);
    entryLines.push(`    path: ${JSON.stringify(op.path)},`);
    entryLines.push(`    service: ${JSON.stringify(op.service)},`);
    if (op.functionName) {
      entryLines.push(`    functionName: ${JSON.stringify(op.functionName)},`);
    }
    if (op.pathParams.length > 0) {
      entryLines.push(`    pathParams: ${JSON.stringify(op.pathParams)},`);
    }
    entryLines.push(`    source: ${JSON.stringify(formatSource(op))},`);
    entryLines.push(
      `    summary: ${JSON.stringify(
        `Generated from ${op.file}${op.functionName ? `#${op.functionName}` : ''}`
      )},`
    );
    if (op.pathParams.length > 0) {
      entryLines.push(`    buildPath: ${buildPathFactory(op)},`);
    }
    entryLines.push('  },');
    lines.push(entryLines.join('\n'));
  });

  lines.push('};');
  lines.push('');
  lines.push('export function createEndpointCaller(client = apiClient) {');
  lines.push('  return function call(operationId, options = {}) {');
  lines.push('    const entry = operations[operationId];');
  lines.push('    if (!entry) {');
  lines.push('      throw new Error(`Unknown operation "${operationId}"`);');
  lines.push('    }');
  lines.push('    const { pathParams, query, data, config } = options;');
  lines.push(
    '    const url = entry.buildPath && pathParams ? entry.buildPath(pathParams) : entry.path;'
  );
  lines.push('    const requestConfig = { ...(config || {}) };');
  lines.push('    if (query) {');
  lines.push('      requestConfig.params = query;');
  lines.push('    }');
  lines.push('    const verb = entry.method.toLowerCase();');
  lines.push("    if (verb === 'get' || verb === 'delete') {");
  lines.push('      return client[verb](url, requestConfig);');
  lines.push('    }');
  lines.push('    return client[verb](url, data ?? {}, requestConfig);');
  lines.push('  };');
  lines.push('}');
  lines.push('');
  lines.push('export const callOperation = createEndpointCaller();');
  lines.push('');
  lines.push('export default operations;');
  lines.push('');

  return `${lines.join('\n')}`;
}

function buildPathFactory(op) {
  const paramNames = op.pathParams;
  const uniqueParams = [...new Set(paramNames)];
  const guardLines = uniqueParams.map(
    (name) =>
      `      if (params.${name} === undefined) {\n        throw new Error('Missing path param "${name}" for ${op.operationId}');\n      }`
  );

  const template = op.pathSegments
    .map((segment) => {
      if (segment.type === 'literal') {
        return segment.value
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$\{/g, '\\${');
      }
      return `\${encodeURIComponent(params.${segment.name})}`;
    })
    .join('');

  const body = [
    '(params = {}) => {',
    ...guardLines,
    `      return \`${template}\`;`,
    '    }',
  ].join('\n');

  return body;
}

function formatSource(op) {
  if (!op.loc) return op.file;
  return `${op.file}:${op.loc.line}:${op.loc.column}`;
}
