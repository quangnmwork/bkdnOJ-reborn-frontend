import axiosClient from "api/axiosClient";
import {SWRConfig} from "swr";
export const fetcher = resource =>
  axiosClient.get(resource).then(res => res.data);
const SWRLayout = ({children}) => {
  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRLayout;
