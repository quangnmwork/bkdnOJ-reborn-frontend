import axiosClient from "api/axiosClient";
import {SWRConfig} from "swr";

const fetcher = url => axiosClient.get(url).then(res => res.data);
const SWRLayout = ({children}) => {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        fetcher,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRLayout;
