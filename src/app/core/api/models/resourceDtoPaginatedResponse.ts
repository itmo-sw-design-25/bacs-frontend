/**
 * BaCS API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ResourceDto } from './resourceDto';


export interface ResourceDtoPaginatedResponse { 
    /**
     * Коллекция элементов.
     */
    collection?: Array<ResourceDto> | null;
    /**
     * Общее количество элементов в коллекции.
     */
    totalCount?: number;
}

