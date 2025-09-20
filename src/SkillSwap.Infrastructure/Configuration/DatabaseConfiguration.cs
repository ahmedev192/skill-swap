using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillSwap.Infrastructure.Data;

namespace SkillSwap.Infrastructure.Configuration;

public static class DatabaseConfiguration
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddDbContext<SkillSwapDbContext>(options =>
            options.UseSqlServer(connectionString, b => 
            {
                b.MigrationsAssembly("SkillSwap.Infrastructure");
                b.CommandTimeout(30);
            })
            .ConfigureWarnings(warnings => warnings.Throw(RelationalEventId.MultipleCollectionIncludeWarning)));

        return services;
    }
}
