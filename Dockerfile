# Multi-stage build for .NET application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080


# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["Shoestore.csproj", "./"]
COPY ["*.sln", "./"]

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet build "Shoestore.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Shoestore.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "Shoestore.dll"] 