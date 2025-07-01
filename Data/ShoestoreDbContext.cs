using Microsoft.EntityFrameworkCore;
using Shoestore.Models;

namespace Shoestore.Data
{
    public class ShoeStoreDbContext : DbContext
    {
        public ShoeStoreDbContext(DbContextOptions<ShoeStoreDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<CartOrderMapping> CartOrderMappings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Default value for Customer.Role
            modelBuilder.Entity<Customer>()
                .Property(c => c.Role)
                .HasDefaultValue(false);

            // Product -> Category relationship
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .IsRequired();

            // Product owns Specs
            modelBuilder.Entity<Product>()
                .OwnsOne(p => p.Specs);

            // CartOrderMapping: Chỉ định khóa chính
            modelBuilder.Entity<CartOrderMapping>()
                .HasKey(com => com.Id);

            // CartOrderMapping -> Cart relationship
            modelBuilder.Entity<CartOrderMapping>()
                .HasOne(com => com.Cart)
                .WithMany()
                .HasForeignKey(com => com.CartId)
                .OnDelete(DeleteBehavior.Cascade); // Giữ CASCADE cho CartId

            // CartOrderMapping -> Order relationship
            modelBuilder.Entity<CartOrderMapping>()
                .HasOne(com => com.Order)
                .WithMany()
                .HasForeignKey(com => com.OrderId)
                .OnDelete(DeleteBehavior.NoAction); // Thay CASCADE thành NO ACTION cho OrderId

            // Cart -> Product relationship
            modelBuilder.Entity<Cart>()
                .HasOne(c => c.Product)
                .WithMany()
                .HasForeignKey(c => c.ProductId);
        }
    }
}