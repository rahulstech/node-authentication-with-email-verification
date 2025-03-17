export function createResult(axiosResponse) {
    return { 
        success: axiosResponse.status >= 200 && axiosResponse.status < 300,
        status: axiosResponse.status, 
        data: axiosResponse.data 
    };
}

export function catchAxiosError(requetHandler) {
    return (...args) => {
        return new Promise(async (resolve,reject) => {
            try {
                const result = await requetHandler(...args);
                resolve(result);
            }
            catch(error) {
                if (error.name === 'AxiosError') {
                    // TODO: handle connection refuse 
                    
                    const result = { 
                        status: error.status, 
                        data: error.response.data 
                    };

                    if (result.data?.details) {
                        const errors = result.data.details.reduce( (acc, item) => {
                            acc[item.key] = item.explain;
                            return acc;
                        }, {});
                        result.errors = error;
                    }
                    if (result.data?.description) {
                        result.errorReason = result.data.description;
                    }

                    resolve(result);
                }
                else {
                    reject(error);
                }
            }
        });
    }
}