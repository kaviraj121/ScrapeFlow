import { getUserCredentials } from "@/actions/credentials/getUserCredentials";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ParamProps } from "@/type/appNode";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";

function CredentialsParam({ param, updateNodeParamValue, value }: ParamProps) {
    const id = useId();
  
    const query = useQuery({
      queryKey: ["credentials-for-user"],
      queryFn: () => getUserCredentials(),
      refetchInterval: 10000,
    });
  
    return (
      <div className="flex flex-col gap-1 w-full">
        <Label htmlFor={id} className="text-xs flex">
          {param.name}
          {param.required && <p className="text-red-400 px-2">*</p>}
        </Label>
        <Select
          onValueChange={(value) => updateNodeParamValue(value)}
          value={value}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Credentials</SelectLabel>
              {query.data?.map((credential) => (
                <SelectItem key={credential.id} value={credential.id}>
                  {credential.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  export default CredentialsParam;