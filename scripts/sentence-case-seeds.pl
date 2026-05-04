#!/usr/bin/perl
# Normaliza los nombres de producto en los seeds a sentence-case:
# primera letra mayúscula, el resto minúscula. Conserva los acentos.
#
# Uso:  perl scripts/sentence-case-seeds.pl
# Sólo toca el segundo argumento de las funciones p(...) — los demás
# (id, emoji, categoría) se quedan como están.

use strict;
use warnings;
use utf8;
use open ':std', ':encoding(UTF-8)';

my @files = glob 'src/lib/data/products/*.ts';
my $changed = 0;

for my $file (@files) {
    open my $fh, '<:encoding(UTF-8)', $file or die "open $file: $!";
    local $/; my $content = <$fh>;
    close $fh;

    my $orig = $content;
    # p('id', 'NAME', ...) — capturamos el prefijo (incluida la coma) y el name.
    $content =~ s/(p\(\s*'[^']+'\s*,\s*)'([^']+)'/$1 . "'" . sentencecase($2) . "'"/ge;

    if ($content ne $orig) {
        open my $out, '>:encoding(UTF-8)', $file or die "write $file: $!";
        print $out $content;
        close $out;
        $changed++;
        print "✔ $file\n";
    }
}

print "\nArchivos modificados: $changed\n";

sub sentencecase {
    my ($s) = @_;
    return $s if $s eq '';
    # lowercase todo, luego sube la primera letra. Unicode-safe.
    my $lower = lc $s;
    return ucfirst $lower;
}
