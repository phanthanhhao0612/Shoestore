using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shoestore.Migrations
{
    /// <inheritdoc />
    public partial class Db12 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "Products",
                newName: "Specs_Weight");

            migrationBuilder.RenameColumn(
                name: "Material",
                table: "Products",
                newName: "Specs_Material");

            migrationBuilder.RenameColumn(
                name: "Color",
                table: "Products",
                newName: "Specs_Color");

            migrationBuilder.RenameColumn(
                name: "Hightlights",
                table: "Products",
                newName: "Specs_Highlights");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Specs_Weight",
                table: "Products",
                newName: "Weight");

            migrationBuilder.RenameColumn(
                name: "Specs_Material",
                table: "Products",
                newName: "Material");

            migrationBuilder.RenameColumn(
                name: "Specs_Color",
                table: "Products",
                newName: "Color");

            migrationBuilder.RenameColumn(
                name: "Specs_Highlights",
                table: "Products",
                newName: "Hightlights");
        }
    }
}
