require 'uglifier'
require 'less'

class Preprocessor
  BUILD_DIR = 'build'
  SCRIPTS_DIR = 'scripts'
  STYLES_DIR = 'styles'

  def self.compile_js(js_files)
    puts '[Compress javascript] started'
    File.open(File.join(BUILD_DIR, 'rollup.js'), 'w') do |f|
      js_files.each do |filename|
        puts "[Compress javascript] compiling #{filename}.js"
        f.puts( Uglifier.compile( File.read( File.join(SCRIPTS_DIR, filename + '.js'))));
      end
    end
    puts '[Compress javascript] finished'
  end

  def self.compile_less(less_files)
    puts '[Compile less] started'

    parser = Less::Parser.new :paths => [STYLES_DIR]
    less_files.each do |filename|
      puts "[Compile less] compiling #{filename}.less"
      File.open(File.join(BUILD_DIR, filename + '.css'), 'w') do |f|
        tree = parser.parse(File.read(File.join(STYLES_DIR, filename + '.less')))
        f.puts(tree.to_css(:compress => true))
      end
    end

    puts '[Compile less] finished'
  end
end