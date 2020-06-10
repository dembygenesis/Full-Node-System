require('dotenv').config();

// Parse the damn csv
const utils = require('./services/utils');
const db = require('./services/database/database');
const mysql = require('mysql');

global.connection = [];
global.lastUsedConnection = 0;

// Generate Connections.
for (let i = 0; i < process.env.DB_CONNECTIONS; i++) {

    let config = {
        "host":     process.env.DB_HOST,
        "user":     process.env.DB_USER,
        "password": process.env.DB_PASSWORD,
        "database": process.env.DB_DATABASE,
        "supportBigNumbers": true,
        "bigNumberStrings": true
    };

    if (process.env.DB_PORT) {
        config['port'] = process.env.DB_PORT;
    }

    const IS_LIVE_DB = 0;

    // Live
    if (IS_LIVE_DB) {
        config = {
            "host":     'd.com',
            "user":     'd',
            "password": 'd',
            "database": 'd',
            "supportBigNumbers": true,
            "bigNumberStrings": true
        };
    }

    global.connection.push(mysql.createConnection(config));

    global.connection[i].connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            process.exit();
        } else {
            console.log('MYSQL connection established.');
        }
    });
}

async function insertComplianceCategories() {
    const csvData = await getCSVParsedData();

    let categories = [];

    for (let i in csvData) {
        const category = csvData[i][0];

        categories.push(category);
    }

    categories = categories.filter(value => {
        if (value !== '' && typeof value !== "undefined" && value !== "Category")
            return value;
    });

    categories = [...new Set(
        categories.map(value => {
            if (value !== '' && typeof value !== "undefined")
                return value;
        })
    )]
        .reduce((accumulator, value) => {
            accumulator = accumulator + `('${value}'),`;

            return accumulator;
        }, '');

    categories = categories.substr(0, categories.length - 1);

    let insertSQL = `
        INSERT INTO compliance_category (\`name\`)
            VALUES ${categories}
    `;

    console.log(insertSQL);

    return await db.query(insertSQL, []);
}


async function getCSVParsedData() {
    return new Promise((resolve, reject) => {
        // let parsedData = utils.parseCSVByLocation('./database schema/TESTING2.csv');
        let parsedData = utils.parseCSVByLocation('./database schema/kapa.csv');

        parsedData.then(res => resolve(res)).catch(err => resolve(err));
    });
}

async function deleteAllExistingComplianceRecords() {
    // Clear all.
    const deleteSql = [
        'DELETE FROM compliance_contributor_assigned_measures',
        'DELETE FROM compliance_history',
        'DELETE FROM compliance_document',
        'DELETE FROM compliance_measure_applicable',
        'DELETE FROM compliance_measure',
        'DELETE FROM compliance',
        'DELETE FROM compliance_category',
    ];

    for (let i in deleteSql) {
        try {
            const sql = deleteSql[i];

            await db.query(sql, []);
            console.log('[Success]: ' + sql);
        } catch(err) {
            console.log(err);
        }
    }
}

function getFrequencyAndFrequencyType(entry) {
    const replaceDataBank = {
        'Five Yearly': {
            frequency: 10,
            frequency_type: 'y'
        },
        'Ten yearly': {
            frequency: 10,
            frequency_type: 'y'
        },
        'Twenty five yearly': {
            frequency: 25,
            frequency_type: 'y'
        },
        'Thirty yearly': {
            frequency: 30,
            frequency_type: 'y'
        },
        'Yearly': {
            frequency: 1,
            frequency_type: 'y'
        },
        'Three monthly': {
            frequency: 3,
            frequency_type: 'm'
        },
        '5 Yearly': {
            frequency: 5,
            frequency_type: 'y'
        },
        '4 monthly': {
            frequency: 4,
            frequency_type: 'm'
        },
        '3 Monthly': {
            frequency: 3,
            frequency_type: 'm'
        },
        'Annually': {
            frequency: 1,
            frequency_type: 'y'
        },
        '3 monthly': {
            frequency: 3,
            frequency_type: 'm'
        },
        'Five yearly': {
            frequency: 5,
            frequency_type: 'y'
        },
        '6 monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        '6Monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        'Monthly': {
            frequency: 1,
            frequency_type: 'm'
        },
        'Six monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        '6 Monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        'Annual': {
            frequency: 1,
            frequency_type: 'y'
        },
        'Quarterly': {
            frequency: 4,
            frequency_type: 'm'
        },
        'Every 4 months': {
            frequency: 4,
            frequency_type: 'm'
        },
        '12 monthly': {
            frequency: 1,
            frequency_type: 'y'
        },
        '2 yearly': {
            frequency: 2,
            frequency_type: 'y'
        },
        '5 yearly': {
            frequency: 5,
            frequency_type: 'y'
        },
        'six monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        'Review Every 2 years': {
            frequency: 2,
            frequency_type: 'y'
        },
        'Six Monthly': {
            frequency: 6,
            frequency_type: 'm'
        },
        'Three Monthly': {
            frequency: 3,
            frequency_type: 'm'
        },
        'Three yearly': {
            frequency: 3,
            frequency_type: 'y'
        },
        'Six yearly': {
            frequency: 6,
            frequency_type: 'y'
        },
        'At least every 6 months': {
            frequency: 6,
            frequency_type: 'm'
        },
    };

    entry = entry.trim();

    if (typeof replaceDataBank[entry] !== "undefined") {
        return replaceDataBank[entry];
    }

    return false;
}

function getState(entry) {

    const states = {
        'National': 'National',
        'Vic': 'VIC',
        'Victoria': 'VIC',
        'VIC': 'VIC',
        'NSW': 'NSW',
        'QLD': 'QLD',
        'TAS': 'TAS',
        'SA': 'SA',
        'WA': 'WA',
        'NT': 'NT',
        'ACT': 'ACT',
    };

    if (typeof states[entry] !== "undefined") {
        return states[entry];
    }

    return false;
}

async function getCategory(entry, self) {

    if (self) {
        return entry;
    }

    if (!global.categories) {
        global.categories = await db.query('SELECT * FROM compliance_category');
        global.categories = global.categories.reduce((accumulator, value) => {
            accumulator = {...accumulator};
            accumulator[value.name] = value.id;

            return accumulator;
        }, {});
    }

    let categories = global.categories;

    if (typeof categories[entry] !== "undefined") {
        return categories[entry];
    }

    return false;
}

async function insertComplianceMeasureWithStatesApplicable(state) {

}

async function insertData() {

    /**
     * Validation conditions:
     * 1. Check for valid state
     * 2. Check for valid frequency
     */

    const csvData = await getCSVParsedData();

    let states = [];
    let totalCount = 0;
    let totalParsable = 0;

    for (let i in csvData) {

        let state = getState(csvData[i][3]);

        const complianceCategoryId = await getCategory(csvData[i][0]);
        const frequency = getFrequencyAndFrequencyType(csvData[i][4]);

        if (complianceCategoryId) {
            totalCount++;
        }

        if (state && frequency && complianceCategoryId) {
            totalParsable++;

            const frequencyNumber = frequency.frequency;
            const frequencyType = frequency.frequency_type === 'Y' ? 'year' : 'month';

            const name = utils.escapeStringForInsert(csvData[i][1]);
            const ncc_bca = utils.escapeStringForInsert(csvData[i][2]);
            const standard = utils.escapeStringForInsert(csvData[i][5]);
            const description = utils.escapeStringForInsert(csvData[i][6]);
            const linkToDocument = utils.escapeStringForInsert(csvData[i][7]);

            insertIndividualComplianceMeasure(
                state,
                frequencyNumber,
                frequencyType,
                complianceCategoryId,
                name,
                ncc_bca,
                standard,
                description,
                linkToDocument,
            )
        }
    }

    console.log('Parsable: ' + totalParsable / totalCount * 100);
}
async function generateValidAndInvalidEntriesViaCSV() {

    /**
     * Validation conditions:
     * 1. Check for valid state
     * 2. Check for valid frequency
     */

    const csvData = await getCSVParsedData();

    let valid = '';
    let inValid = '';

    for (let i in csvData) {

        if (csvData[i][0] !== 'categoryid') {
            let state = getState(csvData[i][3]);

            let complianceCategoryId = await getCategory(csvData[i][0], 1);
            let frequency = getFrequencyAndFrequencyType(csvData[i][4]);

            let frequencyNumber = frequency.frequency;
            let frequencyType = frequency.frequency_type === 'Y' ? 'year' : 'month';

            let name = utils.escapeStringForInsert(csvData[i][1]);
            let ncc_bca = utils.escapeStringForInsert(csvData[i][2]);
            let stateName = utils.escapeStringForInsert(csvData[i][3]);
            let frequencyRaw = utils.escapeStringForInsert(csvData[i][4]);
            let standard = utils.escapeStringForInsert(csvData[i][5]);
            let description = utils.escapeStringForInsert(csvData[i][6]);
            let linkToDocument = utils.escapeStringForInsert(csvData[i][7]);

            if (state && frequency && complianceCategoryId) {
                // Im going to need the logs.
                // Generate empty logs.
                valid += `"${complianceCategoryId}","${name}","${ncc_bca}","${stateName}","${frequencyRaw}","${standard}","${description}","${frequencyType}","${frequencyNumber}","${linkToDocument}"\n`;
            } else if (complianceCategoryId) {
                // For new CSV entries with \n as new line separator
                // Decision? If naay category.

                let failures  = '';

                let frequencyData = csvData[i][4].trim();
                let stateData = csvData[i][3].trim();

                stateData = stateData === '' || typeof stateData === 'undefined' ? 'EMPTY.' : stateData + ' (Vague).';
                frequencyData = frequencyData === '' || typeof frequencyData === 'undefined' ? 'EMPTY.' : frequencyData + ' (Vague).';

                if (!frequency) {
                    failures += `FREQUENCY check failed. Data Provided: ${frequencyData}`;
                }

                if (!state) {
                    failures += (failures !== '' ? ' ' : '') + `STATE check failed. Data Provided: ${stateData}`;
                }

                inValid += `"${failures}","${complianceCategoryId}","${name}","${ncc_bca}","${stateName}","${frequencyRaw}","${standard}","${description}","${frequencyType}","${frequencyNumber}","${linkToDocument}"\n`;
            } else {
                // I will not consider empty categoris.
            }
        }
    }

    utils.generateCSVOuput('invalid', inValid, 'Reason For Failure,categoryid,name,ncc_bca,state_name,frequency_provided,standard,description,frequencyType,frequencyNumber,linkToDocument', () => {
        console.log('Ok!');
    });

    utils.generateCSVOuput('valid', valid, 'categoryid,name,ncc_bca,state_name,frequency_provided,standard,description,frequencyType,frequencyNumber,linkToDocument', () => {
        console.log('Ok!');
    });
}

async function insertIndividualComplianceMeasure(
    state,
    frequencyNumber,
    frequencyType,
    complianceCategoryId,
    name,
    ncc_bca,
    standard,
    description,
    linkToDocument,
) {
    const sql = `
        INSERT INTO compliance_measure (
            \`name\`,
            ncc_bca_provisions,
            frequency_type,
            frequency_unit,
            standard,
            compliance_category_id,
            description,
            document_link,
            last_updated
        )
        VALUES (
            '${name}',
            '${ncc_bca}',
            (SELECT id FROM compliance_measure_frequency_category WHERE \`name\` = '${frequencyType}'),
            '${frequencyNumber}',
            '${standard}',
            '${complianceCategoryId}',
            '${description}',
            '${linkToDocument}',
            CURRENT_TIMESTAMP
        )
    `;

    const newId = (await db.query(sql)).insertId;
    const isNational = state === 'National' ? 1 : 0;

    state = state === 'National' ? 'null' : '"' + state + '"';

    const stateApplicableSQL = `
        INSERT INTO compliance_measure_applicable (
            compliance_measure_id,
            is_national,
            \`state\`
        )
        VALUES (
            '${newId}',
            '${isNational}',
            ${state}
        )
    `;

    db.query(stateApplicableSQL)
        .then(res => {
            console.log('HEHEHE');
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
}

async function initiateSeeder() {
    await deleteAllExistingComplianceRecords();
    await insertComplianceCategories();
    await insertData()
}

generateValidAndInvalidEntriesViaCSV();

// initiateSeeder();