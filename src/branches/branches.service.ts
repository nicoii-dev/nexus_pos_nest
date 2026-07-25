import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BranchesRepository } from './branches.repository';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  private readonly branchesLogger = new Logger(`🏢 ${BranchesService.name}`);

  constructor(private readonly branchesRepository: BranchesRepository) {}

  async findAll() {
    const { data, error } = await this.branchesRepository.findAll();

    if (error) {
      this.branchesLogger.error('Error fetching branches:', error);
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return data.map(this.mapDbToResponse);
  }

  async findOne(id: string) {
    const { data, error } = await this.branchesRepository.findOne(id);

    if (error) {
      this.branchesLogger.error(`Error fetching branch ${id}:`, error);
      throw new HttpException(
        error.message,
        HttpStatus.NOT_FOUND
      );
    }

    return this.mapDbToResponse(data);
  }

  async create(createBranchDto: CreateBranchDto) {
    const { data, error } = await this.branchesRepository.create(
      createBranchDto
    );

    if (error) {
      this.branchesLogger.error('Error creating branch:', error);
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    return this.mapDbToResponse(data);
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    await this.findOne(id);

    const { data, error } = await this.branchesRepository.update(
      id,
      updateBranchDto
    );

    if (error) {
      this.branchesLogger.error(`Error updating branch ${id}:`, error);
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    return this.mapDbToResponse(data);
  }

  async remove(id: string) {
    await this.findOne(id);

    const { data, error } = await this.branchesRepository.remove(id);

    if (error) {
      this.branchesLogger.error(`Error deleting branch ${id}:`, error);
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    return this.mapDbToResponse(data);
  }

  private mapDbToResponse(dbRecord: any) {
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      address: dbRecord.address,
      manager: dbRecord.manager,
      contactNumber: dbRecord.contact_number,
      status: dbRecord.status,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
