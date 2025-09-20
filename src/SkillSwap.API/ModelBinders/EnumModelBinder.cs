using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Reflection;

namespace SkillSwap.API.ModelBinders;

public class EnumModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null)
            throw new ArgumentNullException(nameof(bindingContext));

        var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        if (value == ValueProviderResult.None)
            return Task.CompletedTask;

        bindingContext.ModelState.SetModelValue(bindingContext.ModelName, value);

        var valueStr = value.FirstValue;
        if (string.IsNullOrEmpty(valueStr))
            return Task.CompletedTask;

        var modelType = bindingContext.ModelType;
        if (!modelType.IsEnum)
            return Task.CompletedTask;

        // Try to parse as number first
        if (int.TryParse(valueStr, out var intValue))
        {
            if (Enum.IsDefined(modelType, intValue))
            {
                bindingContext.Result = ModelBindingResult.Success(Enum.ToObject(modelType, intValue));
                return Task.CompletedTask;
            }
        }

        // Try to parse as string
        if (Enum.TryParse(modelType, valueStr, true, out var enumValue))
        {
            bindingContext.Result = ModelBindingResult.Success(enumValue);
            return Task.CompletedTask;
        }

        bindingContext.ModelState.TryAddModelError(bindingContext.ModelName, 
            $"Value '{valueStr}' is not valid for {modelType.Name}.");
        bindingContext.Result = ModelBindingResult.Failed();
        return Task.CompletedTask;
    }
}
