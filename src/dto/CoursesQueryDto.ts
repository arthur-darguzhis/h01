// думаю этому файлу в концепции cqrs место в папке query
export type CoursesQueryDto = {
    /**
     * title should not be blank
     */
    title: string;
}
