var express = require('express'),
    _ = require('lodash'),
    db = require('../database/database'),
    fs = require('fs'),
    Utils = require('../../services/utils');

const Service = (function () {

    async function updateData(managementCompanyId, file) {

        // If file and possibly name is provided...
        const fileType = file['image']['mimetype'].split('/')[1];
        const fileDirectory = 'public/' + managementCompanyId;
        const fileDirectoryIsExisting = await Utils.getFileIfExists(fileDirectory);

        if (fileDirectoryIsExisting === false) {
            fs.mkdirSync(fileDirectory);
        }

        await Utils.removeFilesInDir(fileDirectory);

        const newFileName = `logo.${fileType}`;
        const movedFileName = fileDirectory + '/' + newFileName;

        // Move files
        file.image.mv(movedFileName);

        // Update db.
        try {
            let update = update = await db.query(`
                UPDATE management_company
                    SET logo = ?
                WHERE id = ? 
            `, [movedFileName, managementCompanyId]);

            return update;
        } catch (err) {
            return err;
        }
    }

    async function getLogo(managementCompanyId) {
        let sql = `
            SELECT 
                logo 
            FROM management_company mc 
            WHERE 1 = 1 
                AND mc.id = ?
                AND mc.logo IS NOT NULL 
                AND mc.logo != ''
        `;

        let result = await db.query(sql, [managementCompanyId]);

        return result;
    }

    async function updateName(id, name) {

        let sql = `
            UPDATE management_company
            SET \`name\` = ?
            WHERE 1 = 1
                AND id = ?
                AND is_active = 1
        `;

        let result = await db.query(sql, [name, id]);

        return result;
    }

    async function updateSiteWideMessage(id, siteWideMessage) {

        let sql = `
            UPDATE management_company
            SET site_wide_message = ?
            WHERE 1 = 1
                AND id = ?
                AND is_active = 1
        `;

        let result = await db.query(sql, [siteWideMessage, id]);

        return result;
    }

    async function getManagementCompanyDetails(id) {

        let sql = `
            SELECT 
                a.id,
                a.name,
                a.is_active,
                IF (a.logo IS NULL, '', a.logo) AS logo,
                IF (a.site_wide_message IS NULL, '', a.site_wide_message) AS site_wide_message 
            FROM management_company a
            WHERE 1 = 1
                AND id = ?
                AND is_active = 1
        `;

        let result = await db.query(sql, [id]);

        return result;
    }

    return {
        updateData: updateData,
        getLogo: getLogo,
        updateName: updateName,
        updateSiteWideMessage: updateSiteWideMessage,
        getManagementCompanyDetails: getManagementCompanyDetails,
    }

})();

module.exports = Service;