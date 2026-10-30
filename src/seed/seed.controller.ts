import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles.enum';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('users')
  @ApiOperation({
    summary: 'Seed initial test users and default addresses',
    description:
      'Public endpoint to load predefined test users (Super Admin, Admin, Customer) along with their addresses from a local JSON file idempotently.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users seeded successfully.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Users seeded successfully',
        usersInserted: 3,
      },
    },
  })
  async seedUsers() {
    const result = await this.seedService.runUsersSeed();

    return {
      statusCode: 200,
      message: 'Users seeded successfully',
      ...result,
    };
  }

  @Post('products')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload a CSV file to seed database categories and products',
    description:
      'Parses a CSV file containing product and category details, sanitizes the data, and persists missing categories and products. Restricted to ADMIN users.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing raw product and category catalog data',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'CSV processed and database seeded successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. File missing or invalid file extension (must be .csv).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Missing or invalid Bearer JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User lacks the necessary ADMIN role.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv)$/)) {
          return callback(
            new BadRequestException('Only CSV files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadProductsSeed(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload a valid CSV file.');
    }

    const result = await this.seedService.runProductsSeed(file.path);

    return {
      statusCode: 200,
      message: 'CSV file processed and database seeded successfully',
      originalFileName: file.originalname,
      ...result,
    };
  }
}