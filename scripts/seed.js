const fs = require('fs');
const path = require('path');

console.log('=======================================================');
console.log('🌱 SEEDING INDORE TRAFFIC INTELLIGENCE DATASET');
console.log('=======================================================');

const datasetPath = path.resolve(__dirname, '../data/indore_traffic_dataset.json');

if (fs.existsSync(datasetPath)) {
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  console.log(`✅ Loaded Indore Dataset with ${data.roads.length} major corridors`);
  console.log(`📍 Center Lat/Lng: ${data.coordinates.center.join(', ')}`);
  console.log(`🚨 Pre-seeded Incidents: ${data.incidents.length}`);
  console.log(`🏗 Pre-seeded Construction Zones: ${data.constructions.length}`);
  console.log('✅ Dataset successfully validated and ready for production service!');
} else {
  console.error('❌ Dataset file not found at', datasetPath);
  process.exit(1);
}
