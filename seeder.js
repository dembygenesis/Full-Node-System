// Environment settings.
require('dotenv').config();

const mysql = require('mysql');
const csv = require('csv-parse');
const db = require('./services/database/database');

/**
 * Database connection.
 */

global.connection = [];
global.lastUsedConnection = 0;

const measures = [
    {
        state: "National",
        name: "Emergency Lighting",
        ncc_bca_provisions: "BCA E4.2, E4.4,",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "",
        description: "Testing to check that the fittings are in working order and last the required time frame as well as assessing the site for appropriate coverage.",
    },
    {
        state: "National",
        name: "Emergency & Exit Lighting - measurement of light output",
        ncc_bca_provisions: "",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "AS2293.2",
        description: "A full battery discharge of each emergency and exit light for 90 minutes must be performed every 6 months and written records of these tests must be kept.   Exit signs must  undergo a colour, luminance and format test to ensure they meet the criteria for exit signs.",
    },
    {
        state: "VIC",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "Victoria Building Regulations 2018, Part 15, Division 1 - Maintenance of buildings and places of public entertainment Division 1—Maintenance of essential safety measures",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "",
        description: "Inspection, testing and maintenance required for an essential safety measure in a building or place of public entertainment as per AS 1851-2012",
    },
    {
        state: "NSW",
        name: "Annual Fire Safety Statement",
        ncc_bca_provisions: "Environmental Planning and Assessment Regulation 2000. Part 9, Item 166 Essential Safety Measures",
        frequency_type: "2",
        frequency_unit: "1",
        standard: "",
        description: "Emergency & Exit Lighting to be included in the annual fire safety statement as an essential safety measure.",
    },
    {
        state: "QLD",
        name: "Occupier's Statement - Schedule of Maintenance of Fire Safety Installations",
        ncc_bca_provisions: "Queensland Development Code MP6.1",
        frequency_type: "2",
        frequency_unit: "1",
        standard: "",
        description: "Annual Occupier's Statement to be kept on site with building maintenance records.",
    },
    {
        state: "QLD",
        name: "Maintenance of prescribed fire safety installations - Emergency & Exit Lighting",
        ncc_bca_provisions: "Building Fire Safety Regulation 2008; Part 5, Division 3",
        frequency_type: "2",
        frequency_unit: "1",
        standard: "",
        description: "",
    },
    {
        state: "TAS",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "General Fire Regulations 2010; Part 2, Item 6, 7",
        frequency_type: "2",
        frequency_unit: "1",
        standard: "",
        description: "The occupier of the prescribed building must ensure that the fire protection equipment is maintained so as to be capable of operating to the standard to which it was designed.  A record of maointenance is to be kept and produced on demand by an authorised person.",
    },
    {
        state: "TAS",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "General Fire Regulations 2010; Part 3, Division 1, Item 14 - Exits and emergency lighting",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "",
        description: "The occupier of a prescribed building must ensure that its required emergency lighting is operational at all times",
    },
    {
        state: "SA",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "SA Work Health & Safety Regulations 2012; Chapter 3, Part 1",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "AS2293",
        description: "Managing Risks to Health & Safety",
    },
    {
        state: "WA",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "WA Department of Health :- Electrical and Lighting Requirements - Public Buildings; As per AS2293",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "AS2293",
        description: "Maintenance as per National standard AS2293.2",
    },
    {
        state: "ACT",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "Work Health & Safety Regulation 2011 Chapter 3, Part 3.1, item 37",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "AS2293",
        description: "Control Measures to be maintained as per National standards",
    },
    {
        state: "NT",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "Fire and Emergency Regulations 2017 Part 2, item 11 (6)",
        frequency_type: "1",
        frequency_unit: "6",
        standard: "AS2293",
        description: "Maintenance of emergency & exit lighting in prescribed buildings in accordance with relevant standards - AS2293.2",
    },
    {
        state: "NT",
        name: "Emergency & Exit Lighting",
        ncc_bca_provisions: "Fire and Emergency Regulations 2017 Part 2, item 11 (6)",
        frequency_type: "2",
        frequency_unit: "1",
        standard: "AS2293",
        description: "Maintenance of emergency & exit lighting in prescribed buildings in accordance with relevant standards - AS2293.2",
    },
];

const measureRegions = [

];

// Generate Connections.
for (let i = 0; i < process.env.DB_CONNECTIONS; i++) {

    global.connection.push(mysql.createConnection({
        "host":     process.env.DB_HOST,
        "user":     process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "supportBigNumbers": true,
        "bigNumberStrings": true
    }));

    global.connection[i].connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            process.exit();
        } else {
            console.log('MYSQL connection established.');
        }
    });
}

async function seedStates() {
    try {
        const deleteSql = `DELETE FROM austrailia_states;`;
        const insertSql = `
            INSERT INTO austrailia_states (state, name)
            VALUES 
              ('NSW', 'New South Wales'),
              ('QLD', 'Queensland'),
              ('SA', 'South Australia'),
              ('TAS', 'Tasmania'),
              ('VIC', 'Victoria'),
              ('WA', 'Western Australia'),
              ('ACT', 'Australian Capital Territory'),
              ('JBT', 'Jervis Bay Territory'),
              ('NT', 'Northern Territory'),
              ('AAT', 'Australian Antarctic Territory'),
              ('HIMI', 'Heard Island and McDonald Islands')
        `;

        await db.query(deleteSql);
        await db.query(insertSql);
    } catch (e) {
        console.log('e', e);
    }
}

async function seedPostalCodes() {
    const filePath = "./data/postcodes.csv";
    const csv = require("csvtojson");
    const fs = require("fs");

    const deleteSql = `DELETE FROM austrailia_postcodes;`;

    await db.query(deleteSql);

    // Parse and read per 500.
    const postCodeDataset = await csv().fromFile(filePath);

    let sql = `INSERT INTO austrailia_postcodes VALUES `;
    let iterator = 0;
    let insertSQL = '';

    for (let i in postCodeDataset) {
        iterator++;

        let postCode = postCodeDataset[i]['postcode'].length === 3
            ? '0' + postCodeDataset[i]['postcode']
            : postCodeDataset[i]['postcode'];

        const state = postCodeDataset[i]['state'];

        insertSQL += `('${postCode}', '${state}'),`;

        if (iterator % 500 === 0 || iterator === postCodeDataset.length) {

            insertSQL = insertSQL.substring(0, insertSQL.length - 1);
            const execute = sql + insertSQL;

            db.query(execute)
                .catch(err => {
                    console.log(err);
                });

            insertSQL = '';

        }
    }
}

async function seedMeasures() {
    let insertSQL = `INSERT INTO compliance_measure (name, ncc_bca_provisions, frequency_type, 
                                       frequency_unit, standard, description) VALUES`;

    let values = '';

    for (let i in measures) {
        const name = measures[i]['name'];
        const ncc_bca_provisions = measures[i]['ncc_bca_provisions'];
        const frequency_type = measures[i]['frequency_type'];
        const frequency_unit = measures[i]['frequency_unit'];
        const standard = measures[i]['standard'];
        const description = measures[i]['description'];

        values += `(
            "${name}",
            "${ncc_bca_provisions}",
            "${frequency_type}",
            "${frequency_unit}",
            "${standard}",
            "${description}"
        ),`;
    }

    insertSQL += values;

    insertSQL = insertSQL.substring(0, insertSQL.length - 1);

    const categorySql = `
        INSERT INTO \`compliance_link\`.\`compliance_category\` (\`name\`) 
        VALUES
          ('Essential Services - Emergency & Exit Lighting') ;
    `;

    db.query(categorySql)
        .then(() => {
            db.query(insertSQL)
                .catch(err => {
                    console.log(err);
                });
        });

    console.log(insertSQL);
}

// seedStates();
// seedPostalCodes();
seedMeasures();