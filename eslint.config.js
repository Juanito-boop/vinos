import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended
});

// Singleton cache to ensure identical plugin object references
const pluginCache = new Map();

// Load the base config and sanitize it aggressively to break circularity
const eslintConfig = [
	...compat.extends("next/core-web-vitals").map(config => {
		if (!config.plugins) return config;

		const sanitizedPlugins = {};
		for (const [name, plugin] of Object.entries(config.plugins)) {
			if (!pluginCache.has(name)) {
				// Extract only what's needed for ESLint 9 to avoid circularity in legacy props
				pluginCache.set(name, {
					rules: plugin.rules,
					processors: plugin.processors,
				});
			}
			sanitizedPlugins[name] = pluginCache.get(name);
		}

		return {
			...config,
			plugins: sanitizedPlugins
		};
	}),
	{
		rules: {
			indent: ["error", "tab"],
			"no-tabs": "off"
		}
	}
];

export default eslintConfig;
