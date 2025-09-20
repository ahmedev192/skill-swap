# Credit System Dependency Fix

## Issue
The `UserService` was trying to use `_creditService` but it wasn't injected as a dependency, causing compilation errors:
```
The name '_creditService' does not exist in the current context
```

## Root Cause
The `UserService` was updated to use `_creditService.GetUserAvailableBalanceAsync()` but the `ICreditService` dependency wasn't added to the constructor.

## Fix Applied

### 1. Added ICreditService Dependency
Updated `UserService` constructor to inject `ICreditService`:

```csharp
public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICreditService _creditService; // Added

    public UserService(UserManager<User> userManager, IUnitOfWork unitOfWork, IMapper mapper, ICreditService creditService)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _creditService = creditService; // Added
    }
}
```

### 2. Updated GetUserCreditBalanceAsync Method
Replaced the duplicate implementation with a call to the CreditService:

```csharp
public async Task<decimal> GetUserCreditBalanceAsync(string userId)
{
    return await _creditService.GetUserCreditBalanceAsync(userId);
}
```

## Result
- ✅ Compilation errors resolved
- ✅ UserService now properly uses CreditService
- ✅ No duplicate credit calculation logic
- ✅ Dependency injection working correctly

## Files Modified
- `src/SkillSwap.Infrastructure/Services/UserService.cs`

The credit system is now fully functional with proper dependency injection and no compilation errors.
