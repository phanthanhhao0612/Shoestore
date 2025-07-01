using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shoestore.Migrations
{
    /// <inheritdoc />
    public partial class db121 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProductId1",
                table: "Carts",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CartOrderMappings",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CartId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OrderId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartOrderMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartOrderMappings_Carts_CartId",
                        column: x => x.CartId,
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CartOrderMappings_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "OrderId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Carts_ProductId1",
                table: "Carts",
                column: "ProductId1");

            migrationBuilder.CreateIndex(
                name: "IX_CartOrderMappings_CartId",
                table: "CartOrderMappings",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_CartOrderMappings_OrderId",
                table: "CartOrderMappings",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_Products_ProductId1",
                table: "Carts",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carts_Products_ProductId1",
                table: "Carts");

            migrationBuilder.DropTable(
                name: "CartOrderMappings");

            migrationBuilder.DropIndex(
                name: "IX_Carts_ProductId1",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "Carts");
        }
    }
}
