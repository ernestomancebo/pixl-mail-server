import { ERROR_INTERNAL, ERROR_INVALID, ErrorMap } from '../models/error-mapping';
import { ServiceResponse } from '../models/service-response';

export class ResponseUtil {

  public static buildSuccessResponse(): ServiceResponse {
    const response: ServiceResponse = {
      success: true,
      message: '',
      statusCode: '',
      errorList: []
    };

    return response;
  }

  public static buildProcessingErrorResponse(parameters: any): ServiceResponse {
    const parametersProvided: string = JSON.stringify(parameters);
    return this.buildBaseErrorResponse(ERROR_INTERNAL, [`There was an error: ${parametersProvided}`]);
  }

  public static buildInvalidParametersResponse(parameters: any): ServiceResponse {
    const parametersProvided: string = JSON.stringify(parameters);
    return this.buildBaseErrorResponse(ERROR_INVALID, [`input parameters: ${parametersProvided}`]);
  }

  private static buildBaseErrorResponse(error: ErrorMap, errorList: string[]): ServiceResponse {

    const response: ServiceResponse = {
      success: false,
      message: error.errorDescription,
      statusCode: error.errorCode,
      errorList: errorList ? errorList : [
        `${error.errorCode}: ${error.errorDescription}`
      ]
    };

    return response;
  }
}
