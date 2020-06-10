exports.getHistoryTransactionFragment = (userId, userCategory, userEntity) => {
    const sql = `
        INSERT INTO user_activity (
            user_id,
            user_activity_entity_id,
            user_activity_category_id
          )
          VALUES
          (
            ${userId},
            (SELECT \`id\` FROM user_activity_entity WHERE \`name\` = '${userEntity}'),
            (SELECT \`id\` FROM user_activity_category WHERE \`name\` = '${userCategory}')
          ) ;
    `;

    return {
        stmt: sql,
        args: [
            userId,
        ]
    };
};

// Modify this function to get all the transaction results... But maybe in the future,
// for now - I have to defer that because it is not needed in my use case requirements.
// Done! Lol
exports.buildTransactionFragment = (sql, args) => ({ stmt: sql, args: args });
