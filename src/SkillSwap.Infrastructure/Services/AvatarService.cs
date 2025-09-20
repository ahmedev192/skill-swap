using SkillSwap.Core.DTOs;
using SkillSwap.Core.Services;

namespace SkillSwap.Infrastructure.Services;

public class AvatarService : IAvatarService
{
    private readonly List<AvatarProvider> _avatarProviders;
    private readonly Random _random;

    public AvatarService()
    {
        _random = new Random();
        _avatarProviders = InitializeAvatarProviders();
    }

    public string GenerateRandomAvatarUrl(string? seed = null)
    {
        var provider = _avatarProviders[_random.Next(_avatarProviders.Count)];
        var avatarSeed = seed ?? Guid.NewGuid().ToString();
        
        return provider.GenerateUrl(avatarSeed);
    }

    public List<AvatarOption> GetAvailableAvatarOptions()
    {
        var options = new List<AvatarOption>();
        
        foreach (var provider in _avatarProviders)
        {
            options.Add(new AvatarOption
            {
                Name = provider.Name,
                Url = provider.GenerateUrl(Guid.NewGuid().ToString()),
                Provider = provider.ProviderName,
                Description = provider.Description
            });
        }
        
        return options;
    }

    public string GetAvatarUrl(string? seed, string? customUrl = null)
    {
        if (!string.IsNullOrEmpty(customUrl))
        {
            return customUrl;
        }

        if (string.IsNullOrEmpty(seed))
        {
            return GenerateRandomAvatarUrl();
        }

        // Use the seed to consistently generate the same avatar for the same user
        var providerIndex = Math.Abs(seed.GetHashCode()) % _avatarProviders.Count;
        var provider = _avatarProviders[providerIndex];
        
        return provider.GenerateUrl(seed);
    }

    private List<AvatarProvider> InitializeAvatarProviders()
    {
        return new List<AvatarProvider>
        {
            // DiceBear Avatars - Professional and diverse
            new AvatarProvider("DiceBear - Avataaars", "DiceBear", "Professional cartoon-style avatars", 
                seed => $"https://api.dicebear.com/7.x/avataaars/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            new AvatarProvider("DiceBear - Personas", "DiceBear", "Realistic human avatars", 
                seed => $"https://api.dicebear.com/7.x/personas/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            new AvatarProvider("DiceBear - Micah", "DiceBear", "Minimalist geometric avatars", 
                seed => $"https://api.dicebear.com/7.x/micah/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            new AvatarProvider("DiceBear - Bottts", "DiceBear", "Robot-style avatars", 
                seed => $"https://api.dicebear.com/7.x/bottts/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            new AvatarProvider("DiceBear - Identicon", "DiceBear", "Geometric pattern avatars", 
                seed => $"https://api.dicebear.com/7.x/identicon/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            new AvatarProvider("DiceBear - Initials", "DiceBear", "Initial-based avatars", 
                seed => $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf"),
            
            // UI Avatars - Simple and clean
            new AvatarProvider("UI Avatars - Default", "UI Avatars", "Simple text-based avatars", 
                seed => $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(seed)}&background=random&color=fff&size=200&format=svg"),
            
            new AvatarProvider("UI Avatars - Bold", "UI Avatars", "Bold style avatars", 
                seed => $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(seed)}&background=random&color=fff&size=200&format=svg&bold=true"),
            
            // Gravatar-style alternatives
            new AvatarProvider("Boring Avatars", "Boring Avatars", "Geometric and abstract avatars", 
                seed => $"https://source.boringavatars.com/beam/200/{Uri.EscapeDataString(seed)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"),
            
            new AvatarProvider("Boring Avatars - Marble", "Boring Avatars", "Marble-style avatars", 
                seed => $"https://source.boringavatars.com/marble/200/{Uri.EscapeDataString(seed)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"),
            
            new AvatarProvider("Boring Avatars - Pixel", "Boring Avatars", "Pixel-art style avatars", 
                seed => $"https://source.boringavatars.com/pixel/200/{Uri.EscapeDataString(seed)}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51"),
            
            // Multiavatar - Diverse and inclusive
            new AvatarProvider("Multiavatar", "Multiavatar", "Diverse and inclusive avatars", 
                seed => $"https://api.multiavatar.com/{Uri.EscapeDataString(seed)}.svg"),
            
            // Adorable Avatars - Cute and friendly
            new AvatarProvider("Adorable Avatars", "Adorable Avatars", "Cute and friendly avatars", 
                seed => $"https://api.adorable.io/avatars/200/{Uri.EscapeDataString(seed)}.png"),
            
            // Robohash - Robot and monster avatars
            new AvatarProvider("Robohash - Robots", "Robohash", "Robot avatars", 
                seed => $"https://robohash.org/{Uri.EscapeDataString(seed)}.png?set=set1&size=200x200"),
            
            new AvatarProvider("Robohash - Monsters", "Robohash", "Monster avatars", 
                seed => $"https://robohash.org/{Uri.EscapeDataString(seed)}.png?set=set2&size=200x200"),
            
            new AvatarProvider("Robohash - Heads", "Robohash", "Human head avatars", 
                seed => $"https://robohash.org/{Uri.EscapeDataString(seed)}.png?set=set3&size=200x200"),
            
            new AvatarProvider("Robohash - Cats", "Robohash", "Cat avatars", 
                seed => $"https://robohash.org/{Uri.EscapeDataString(seed)}.png?set=set4&size=200x200"),
            
            // Lorem Picsum - Random images (as fallback)
            new AvatarProvider("Lorem Picsum", "Lorem Picsum", "Random nature images", 
                seed => $"https://picsum.photos/200/200?random={Math.Abs(seed.GetHashCode())}")
        };
    }

    private class AvatarProvider
    {
        public string Name { get; }
        public string ProviderName { get; }
        public string Description { get; }
        private readonly Func<string, string> _urlGenerator;

        public AvatarProvider(string name, string providerName, string description, Func<string, string> urlGenerator)
        {
            Name = name;
            ProviderName = providerName;
            Description = description;
            _urlGenerator = urlGenerator;
        }

        public string GenerateUrl(string seed)
        {
            return _urlGenerator(seed);
        }
    }
}
