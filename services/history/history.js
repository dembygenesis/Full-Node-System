exports.getHistoryTransactionFragment = (userId, userCategory, userEntity) => {
    const sql = `
        INSERT INTO user_activity (
            user_id,
            user_activity_entity_id,
            user_activity_category_id
          )
          VALUES
          (
            ?,
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

