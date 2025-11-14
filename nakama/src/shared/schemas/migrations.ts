// Minimal migration registry for module-level migrations.
// export type MigrationFn = (data: any) => any;

// // registry: module => array of labelled migrations
// const registry: Record<string, { from: string; to: string; fn: MigrationFn }[]> = {
//   crop: [
//     {
//       from: '1.0.0',
//       to: '1.0.1',
//       fn: (data) => {
//         // add last_watered default
//         if (data.plots && Array.isArray(data.plots)) {
//           data.plots = data.plots.map((p: any) => ({ last_watered: null, ...p }));
//         }
//         return data;
//       }
//     }
//   ],
//   building: [
//     {
//       from: '2.0.0',
//       to: '2.1.0',
//       fn: (data) => {
//         // rename `durability` to `hp` if present
//         if (data.buildings && Array.isArray(data.buildings)) {
//           data.buildings = data.buildings.map((b: any) => ({ hp: b.durability ?? b.hp ?? 100, ...b }));
//         }
//         return data;
//       }
//     }
//   ]
// };

// export function migrateModule(moduleName: string, from: string, to: string, data: any) {
//   const migrations = registry[moduleName] || [];
//   // naive incremental runner: find path from->to applying in-order
//   let current = from;
//   while (current !== to) {
//     const next = migrations.find(m => m.from === current);
//     if (!next) throw new Error(`No migration from ${current} for module ${moduleName}`);
//     data = next.fn(data);
//     current = next.to;
//   }
//   return data;
// }

// export function registerMigration(moduleName: string, from: string, to: string, fn: MigrationFn) {
//   registry[moduleName] = registry[moduleName] || [];
//   registry[moduleName].push({ from, to, fn });
// }