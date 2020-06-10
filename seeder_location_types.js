const db = require('./services/database/database');

const data = [
    'Retail - Regional Shopping Centre',
    'Retail - Sub-Regional Shopping Centre',
    'Retail - Neighbourhood/Town Shopping Centre',
    'Retail - Arcade',
    'Retail - Suburban shopping precinct',
    'Retail - Single retail tenancy (< 500 sqm)',
    'Retail - Big box/Major Retailer single retail tenancy',

    'Residential - Single level apartment groups',
    'Residential - Multi level apartments',
    'Residential - Aged care facilities',
    'Residential - Commercial/Industrial (more to be added)',
    'Residential - Commercial buildings (single & multi story)',
    'Residential - Industrial factories, warehouses, distribution centres, manufacturing',
    'Residential - Hospitals & medical',
    'Residential - Entertainment & sporting venues',
];

let insertSQL = `INSERT INTO location_type (\`name\`) VALUES  `;

for (let i in data) {
    insertSQL += `('${data[i]}'),`;
}


console.log(insertSQL);