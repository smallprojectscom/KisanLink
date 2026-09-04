#ifndef DATABASE_H
#define DATABASE_H

#include <sqlite3.h>

int database_open(sqlite3 **db);
void database_close(sqlite3 *db);

int register_user(
    sqlite3 *db,
    const char *name,
    const char *email,
    const char *mobile,
    const char *state,
    const char *district,
    const char *pincode,
    const char *role,
    const char *password
);

int login_user(
    sqlite3 *db,
    const char *identifier,
    const char *password,
    int *user_id,
    char *role,
    int role_size,
    char *name,
    int name_size
);

int add_product(
    sqlite3 *db,
    int farmer_id,
    const char *crop_name,
    double quantity,
    const char *unit,
    double price,
    const char *location,
    const char *description
);

int create_request(
    sqlite3 *db,
    int product_id,
    int buyer_id,
    double quantity,
    const char *message
);

int get_products_json(
    sqlite3 *db,
    char *output,
    int output_size
);

/* Request Management */

int get_requests_json(
    sqlite3 *db,
    int user_id,
    const char *role,
    char *output,
    int output_size
);

int update_request_status(
    sqlite3 *db,
    int request_id,
    int farmer_id,
    const char *status
);

int create_deal_from_request(
    sqlite3 *db,
    int request_id,
    int farmer_id
);

int get_deals_json(
    sqlite3 *db,
    int user_id,
    const char *role,
    char *output,
    int output_size
);

int complete_deal(
    sqlite3 *db,
    int deal_id,
    int user_id
);
int get_matches_json(sqlite3 *db, const char *crop, double quantity, const char *location, double max_price, char *output, int output_size);

int get_price_json(
    sqlite3 *db,
    const char *crop_name,
    char *output,
    int output_size
);
#endif



